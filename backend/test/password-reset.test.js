import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import bcrypt from "bcrypt";
import { app } from "../src/app.js";
import User from "../src/models/user.model.js";
import { handleJsonParseError } from "../src/middlewares/error.middleware.js";

const email = "reader@example.com";
const oldPassword = "old-password";
const newPassword = "new-password";
const digest = (token) => createHash("sha256").update(token).digest("hex");

// Exercise the actual Express routes, Pug views, crypto, and bcrypt without MongoDB.
// The in-memory model preserves the token/expiration condition on atomic updates.
describe("password reset", { concurrency: false }, () => {
  let server;
  let baseUrl;
  let originalPasswordHash;
  let storedUser;
  let logLines;
  let modelCalls;
  let providerBehavior;
  let providerRequests;
  const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    PASSWORD_RESET_FROM: process.env.PASSWORD_RESET_FROM,
  };
  const originalFetch = globalThis.fetch;

  function matches(query) {
    if (query._id !== undefined && query._id !== storedUser._id) return false;
    if (query.email !== undefined && query.email !== storedUser.email) return false;
    if (query.resetPasswordToken !== undefined &&
        query.resetPasswordToken !== storedUser.resetPasswordToken) return false;
    if (Object.hasOwn(query, "resetPasswordExpires") && query.resetPasswordExpires === null &&
        storedUser.resetPasswordExpires !== null) return false;
    if (query.resetPasswordExpires?.$gt !== undefined &&
        !(new Date(storedUser.resetPasswordExpires) > query.resetPasswordExpires.$gt)) return false;
    return true;
  }

  function document() {
    return {
      ...storedUser,
      async save() {
        modelCalls.saves += 1;
        const { save, ...fields } = this;
        storedUser = { ...fields };
      },
    };
  }

  async function request(path, { method = "GET", body, html = false } = {}) {
    const headers = { accept: html ? "text/html" : "application/json" };
    if (body !== undefined) {
      headers["content-type"] = html ? "application/x-www-form-urlencoded" : "application/json";
    }
    return fetch(new URL(path, baseUrl), {
      method,
      headers,
      redirect: "manual",
      ...(body === undefined ? {} : {
        body: html ? new URLSearchParams(body).toString() : JSON.stringify(body),
      }),
    });
  }

  async function issueToken(path = "/api/v1/auth/forgot-password") {
    const response = await request(path, { method: "POST", body: { email } });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.resetToken, undefined);
    assert.equal(body.resetUrl, undefined);
    const resetUrl = sentResetUrl(providerRequests.at(-1));
    const resetToken = resetUrl.pathname.split("/").at(-1);
    assert.match(resetToken, /^[a-f0-9]{64}$/);
    return { ...body, resetToken };
  }

  function sentResetUrl(request) {
    const url = request?.payload.text.match(/https?:\/\/\S+/)?.[0];
    assert.ok(url, "the mocked provider receives a reset URL");
    return new URL(url);
  }

  before(async () => {
    originalPasswordHash = await bcrypt.hash(oldPassword, 4);
    process.env.JWT_SECRET = "password-reset-test-secret";
    mock.method(console, "error", (...args) => logLines.push(args.join(" ")));
    mock.method(User, "findOne", (query) => {
      modelCalls.finds += 1;
      const result = Promise.resolve(matches(query) ? document() : null);
      result.select = () => result;
      return result;
    });
    mock.method(User, "findOneAndUpdate", async (query, update) => {
      modelCalls.updates += 1;
      if (!matches(query)) return null;
      storedUser = { ...storedUser, ...update.$set };
      return document();
    });
    mock.method(globalThis, "fetch", async (input, options) => {
      if (String(input) === "https://api.resend.com/emails") {
        const request = {
          url: String(input),
          headers: options.headers,
          payload: JSON.parse(options.body),
          signal: options.signal,
        };
        providerRequests.push(request);
        return providerBehavior(request);
      }
      return originalFetch(input, options);
    });
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    process.env.CLIENT_ORIGIN = "http://127.0.0.1:5173";
  });

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.RESEND_API_KEY = "re_test_key_123456789";
    process.env.PASSWORD_RESET_FROM = "DevHub <no-reply@example.com>";
    logLines = [];
    providerRequests = [];
    providerBehavior = async () => ({ ok: true, status: 200 });
    modelCalls = { finds: 0, saves: 0, updates: 0 };
    storedUser = {
      _id: "507f1f77bcf86cd799439011",
      username: "reader",
      email,
      password: originalPasswordHash,
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };
  });

  after(async () => {
    mock.restoreAll();
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  it("returns generic reset responses for both API aliases without exposing a token", async () => {
    for (const path of ["/api/v1/auth/forgot-password", "/api/v1/auth/forget-password"]) {
      const response = await request(path, { method: "POST", body: { email } });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.resetToken, undefined);
      assert.equal(body.resetUrl, undefined);
    }
  });

  it("sets an HttpOnly authentication cookie after login", async () => {
    const response = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password: oldPassword },
    });

    assert.equal(response.status, 200);
    assert.ok((await response.json()).token);
    assert.match(response.headers.get("set-cookie"), /^token=/);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  });

  it("validates missing or invalid email input and normalizes a valid address", async () => {
    for (const body of [undefined, {}, { email: " " }, { email: [email] }]) {
      const response = await request("/api/v1/auth/forgot-password", { method: "POST", body });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).message, "string");
      assert.equal(modelCalls.finds, 0);
    }
    const response = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email: "  READER@EXAMPLE.COM  " },
    });
    assert.equal(response.status, 200);
    assert.equal(modelCalls.saves, 0);
  });

  it("sends a reset email without leaking the token or URL into responses or logs", async () => {
    const beforeRequest = Date.now();
    const body = await issueToken();
    assert.equal(storedUser.resetPasswordToken, digest(body.resetToken));
    assert.notEqual(storedUser.resetPasswordToken, body.resetToken);
    const expiry = new Date(storedUser.resetPasswordExpires).getTime();
    assert.ok(expiry >= beforeRequest + 3_600_000);
    assert.ok(expiry <= Date.now() + 3_600_000);
    assert.equal(modelCalls.saves, 0);
    assert.equal(providerRequests.length, 1);
    assert.equal(providerRequests[0].url, "https://api.resend.com/emails");
    assert.equal(providerRequests[0].headers.Authorization, `Bearer ${process.env.RESEND_API_KEY}`);
    const url = sentResetUrl(providerRequests[0]);
    assert.equal(url.origin, "http://127.0.0.1:5173");
    assert.equal(url.pathname, `/reset-password/${body.resetToken}`);
    const publicBody = { ...body };
    delete publicBody.resetToken;
    assert.ok(!JSON.stringify(publicBody).includes(body.resetToken));
    assert.ok(!JSON.stringify(publicBody).includes(url.href));
    assert.ok(!logLines.some((line) => line.includes(body.resetToken) || line.includes(url.href)));

    const replacement = await issueToken("/api/v1/auth/forget-password");
    assert.notEqual(replacement.resetToken, body.resetToken);
  });

  it("returns the same public response for known and unknown accounts", async () => {
    const known = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    const unknown = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email: "unknown@example.com" },
    });
    assert.equal(known.status, 200);
    assert.equal(unknown.status, 200);
    assert.deepEqual(await known.json(), await unknown.json());
    assert.equal(providerRequests.length, 1);
  });

  it("invalidates a rejected delivery token without exposing provider details", async () => {
    const providerFailure = "provider secret and recipient details";
    providerBehavior = async () => ({ ok: false, status: 503, body: providerFailure });
    const response = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    const responseBody = await response.json();
    assert.equal(response.status, 200);
    assert.equal(storedUser.resetPasswordToken, null);
    assert.equal(storedUser.resetPasswordExpires, null);
    assert.ok(!JSON.stringify(responseBody).includes(providerFailure));
    assert.ok(!logLines.some((line) => line.includes(providerFailure)));
    assert.equal(logLines.at(-1), "Password reset email delivery failed (provider_rejected).");
  });

  it("does not let a failed concurrent delivery clear a newer token", async () => {
    let releaseFirstDelivery;
    let firstDeliveryStarted;
    const started = new Promise((resolve) => { firstDeliveryStarted = resolve; });
    providerBehavior = async () => {
      if (providerRequests.length === 1) {
        firstDeliveryStarted();
        return new Promise((resolve) => {
          releaseFirstDelivery = () => resolve({ ok: false, status: 503 });
        });
      }
      return { ok: true, status: 200 };
    };

    const firstRequest = request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    await started;
    const secondResponse = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    assert.equal(secondResponse.status, 200);
    const secondToken = sentResetUrl(providerRequests[1]).pathname.split("/").at(-1);
    const secondHash = digest(secondToken);
    assert.equal(storedUser.resetPasswordToken, secondHash);
    assert.ok(storedUser.resetPasswordExpires instanceof Date);

    releaseFirstDelivery();
    const firstResponse = await firstRequest;
    assert.equal(firstResponse.status, 200);
    assert.equal(storedUser.resetPasswordToken, secondHash);
    assert.ok(storedUser.resetPasswordExpires instanceof Date);
    assert.ok(logLines.some((line) => line === "Password reset email delivery failed (provider_rejected)."));
  });

  it("completes the reset API flow and permits login only with the new password", async () => {
    const { resetToken } = await issueToken();
    const reset = await request(`/api/v1/auth/reset-password/${resetToken}`, {
      method: "POST", body: { password: newPassword, confirmPassword: newPassword },
    });
    assert.equal(reset.status, 200);
    assert.equal(storedUser.resetPasswordToken, null);
    assert.equal(storedUser.resetPasswordExpires, null);
    assert.notEqual(storedUser.password, newPassword);
    assert.equal(await bcrypt.compare(newPassword, storedUser.password), true);
    assert.equal(await bcrypt.compare(oldPassword, storedUser.password), false);

    for (const [password, status] of [[oldPassword, 400], [newPassword, 200]]) {
      const login = await request("/api/v1/auth/login", {
        method: "POST", body: { email, password },
      });
      assert.equal(login.status, status);
      if (status === 200) assert.equal(typeof (await login.json()).token, "string");
    }
    const reused = await request(`/api/v1/auth/reset-password/${resetToken}`, {
      method: "POST", body: { password: "another-password", confirmPassword: "another-password" },
    });
    assert.equal(reused.status, 400);
    assert.equal(await bcrypt.compare(newPassword, storedUser.password), true);
  });

  it("rejects invalid and expired reset tokens without changing the password", async () => {
    const { resetToken } = await issueToken();
    storedUser.resetPasswordExpires = new Date(Date.now() - 1);
    for (const token of [resetToken, "not-a-valid-token", "f".repeat(64)]) {
      const response = await request(`/api/v1/auth/reset-password/${token}`, {
        method: "POST", body: { password: newPassword, confirmPassword: newPassword },
      });
      assert.equal(response.status, 400);
      assert.equal(storedUser.password, originalPasswordHash);
    }
  });

  it("keeps a reset token usable after invalid password submissions", async () => {
    const { resetToken } = await issueToken();
    const updatesAfterDelivery = modelCalls.updates;
    const path = `/api/v1/auth/reset-password/${resetToken}`;
    for (const body of [
      {},
      { password: newPassword },
      { password: "short", confirmPassword: "short" },
      { password: newPassword, confirmPassword: "different-password" },
      { password: [newPassword], confirmPassword: [newPassword] },
      { password: 12345678, confirmPassword: 12345678 },
    ]) {
      const response = await request(path, { method: "POST", body });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).message, "string");
      assert.equal(storedUser.password, originalPasswordHash);
      assert.equal(storedUser.resetPasswordToken, digest(resetToken));
    }
    assert.equal(modelCalls.updates, updatesAfterDelivery);
    const reset = await request(path, {
      method: "POST", body: { password: newPassword, confirmPassword: newPassword },
    });
    assert.equal(reset.status, 200);
  });

  it("allows only one of two simultaneous API submissions to consume the token", async () => {
    const { resetToken } = await issueToken();
    const path = `/api/v1/auth/reset-password/${resetToken}`;
    const options = {
      method: "POST", body: { password: newPassword, confirmPassword: newPassword },
    };
    const responses = await Promise.all([request(path, options), request(path, options)]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 400]);
    assert.equal(storedUser.resetPasswordToken, null);
    assert.equal(storedUser.resetPasswordExpires, null);
    assert.equal(await bcrypt.compare(newPassword, storedUser.password), true);
  });

  it("fails closed with the same response when provider configuration is absent", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;
    delete process.env.PASSWORD_RESET_FROM;
    const knownResponse = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    const unknownResponse = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email: "unknown@example.com" },
    });
    assert.equal(knownResponse.status, 503);
    assert.equal(unknownResponse.status, 503);
    assert.deepEqual(await knownResponse.json(), await unknownResponse.json());
    assert.equal(modelCalls.finds, 0);
    assert.equal(modelCalls.updates, 0);
    assert.equal(storedUser.resetPasswordToken, null);
    assert.equal(storedUser.resetPasswordExpires, null);
    assert.ok(!logLines.some((line) => /\/reset-password\//.test(line)));
  });

  it("does not create reset tokens when NODE_ENV is unset", async () => {
    delete process.env.NODE_ENV;
    const response = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    assert.equal(response.status, 503);
    assert.equal(modelCalls.finds, 0);
    assert.equal(modelCalls.updates, 0);
    assert.ok(!logLines.some((line) => /\/reset-password\//.test(line)));
    assert.equal(storedUser.resetPasswordToken, null);
    assert.equal(storedUser.resetPasswordExpires, null);
  });

  it("rejects malformed JSON before model access and forwards unrelated errors", async () => {
    for (const path of ["/api/v1/auth/login", "/api/v1/auth/register", "/forgot-password", "/forget-password"]) {
      const response = await fetch(new URL(path, baseUrl), {
        method: "POST", headers: { "content-type": "application/json" },
        body: '{"email":"reader@example.com",}',
      });
      assert.equal(response.status, 400);
      assert.match((await response.json()).message, /Invalid JSON/);
      assert.deepEqual(modelCalls, { finds: 0, saves: 0, updates: 0 });
    }
    const error = Object.assign(new Error("too large"), { type: "entity.too.large", status: 413 });
    let forwarded;
    handleJsonParseError(error, {}, {
      status() { assert.fail("unrelated errors must not be handled as malformed JSON"); },
    }, (value) => { forwarded = value; });
    assert.equal(forwarded, error);
  });
});
