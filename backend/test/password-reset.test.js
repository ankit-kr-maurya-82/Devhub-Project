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
  const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_URL: process.env.APP_URL,
  };

  function matches(query) {
    if (query.email !== undefined && query.email !== storedUser.email) return false;
    if (query.resetPasswordToken !== undefined &&
        query.resetPasswordToken !== storedUser.resetPasswordToken) return false;
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
    assert.match(body.resetToken, /^[a-f0-9]{64}$/);
    return body;
  }

  async function assertInvalidResetPage(response) {
    assert.equal(response.status, 400);
    const html = await response.text();
    assert.match(html, /reset link is invalid or has expired/i);
    assert.doesNotMatch(html, /<form\b/i);
  }

  function loggedUrl() {
    const line = logLines.findLast((value) => value.includes("Password Reset Link:"));
    assert.ok(line, "development logs contain a reset link");
    const url = line.match(/https?:\/\/\S+/)?.[0];
    assert.ok(url, "the logged link is a full HTTP URL");
    return new URL(url);
  }

  before(async () => {
    originalPasswordHash = await bcrypt.hash(oldPassword, 4);
    process.env.JWT_SECRET = "password-reset-test-secret";
    mock.method(console, "log", (...args) => logLines.push(args.join(" ")));
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
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    process.env.APP_URL = baseUrl;
  });

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    logLines = [];
    modelCalls = { finds: 0, saves: 0, updates: 0 };
    storedUser = {
      _id: "507f1f77bcf86cd799439011",
      username: "reader",
      email,
      password: originalPasswordHash,
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

  it("renders the forgot-password form for both route aliases", async () => {
    for (const path of ["/forgot-password", "/forget-password"]) {
      const response = await request(path, { html: true });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /<form[^>]*action="\/(?:forgot|forget)-password"/);
      assert.match(html, /name="email"/);
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
    assert.equal(modelCalls.saves, 1);
  });

  it("issues an opaque token, stores its hash, and logs a usable development URL", async () => {
    const beforeRequest = Date.now();
    const body = await issueToken();
    assert.equal(storedUser.resetPasswordToken, digest(body.resetToken));
    assert.notEqual(storedUser.resetPasswordToken, body.resetToken);
    const expiry = new Date(storedUser.resetPasswordExpires).getTime();
    assert.ok(expiry >= beforeRequest + 3_600_000);
    assert.ok(expiry <= Date.now() + 3_600_000);
    assert.equal(modelCalls.saves, 1);
    const url = loggedUrl();
    assert.equal(url.origin, baseUrl);
    assert.equal(url.pathname, `/reset-password/${body.resetToken}`);
    assert.equal(body.resetUrl, url.href);
    assert.equal((await request(url.href, { html: true })).status, 200);

    const replacement = await issueToken("/api/v1/auth/forget-password");
    assert.notEqual(replacement.resetToken, body.resetToken);
    assert.equal((await request(url.href, { html: true })).status, 400);
  });

  it("completes the browser flow and permits login only with the new password", async () => {
    const response = await request("/forgot-password", {
      method: "POST", html: true, body: { email },
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(await response.text(), /reset/i);
    const url = loggedUrl();
    const page = await request(url.href, { html: true });
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /name="password"/);
    assert.match(html, /name="confirmPassword"/);
    assert.ok(html.includes(`action="${url.pathname}"`));

    const reset = await request(url.pathname, {
      method: "POST", html: true,
      body: { password: newPassword, confirmPassword: newPassword },
    });
    assert.equal(reset.status, 303);
    assert.equal(reset.headers.get("location"), "/login");
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
    await assertInvalidResetPage(await request(url.pathname, { html: true }));
    for (const body of [
      { password: "short", confirmPassword: "short" },
      { password: newPassword, confirmPassword: "different-password" },
    ]) {
      await assertInvalidResetPage(await request(url.pathname, {
        method: "POST", html: true, body,
      }));
    }
    const reused = await request(url.pathname, {
      method: "POST", body: { password: "another-password", confirmPassword: "another-password" },
    });
    assert.equal(reused.status, 400);
    assert.equal(await bcrypt.compare(newPassword, storedUser.password), true);
  });

  it("rejects invalid and expired links without changing the password", async () => {
    const { resetToken } = await issueToken();
    storedUser.resetPasswordExpires = new Date(Date.now() - 1);
    for (const token of [resetToken, "not-a-valid-token", "f".repeat(64)]) {
      const path = `/reset-password/${token}`;
      await assertInvalidResetPage(await request(path, { html: true }));
      for (const body of [
        { password: "short", confirmPassword: "short" },
        { password: newPassword, confirmPassword: "different-password" },
      ]) {
        await assertInvalidResetPage(await request(path, {
          method: "POST", html: true, body,
        }));
      }
      const reset = await request(path, {
        method: "POST", body: { password: newPassword, confirmPassword: newPassword },
      });
      assert.equal(reset.status, 400);
      assert.equal(storedUser.password, originalPasswordHash);
    }
  });

  it("keeps a reset link usable after missing, short, mismatched, or non-string passwords", async () => {
    const { resetToken } = await issueToken();
    const path = `/reset-password/${resetToken}`;
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
    const formError = await request(path, {
      method: "POST", html: true,
      body: { password: newPassword, confirmPassword: "different-password" },
    });
    assert.equal(formError.status, 400);
    assert.match(await formError.text(), /name="confirmPassword"/);
    assert.equal(modelCalls.updates, 0);
    const reset = await request(path, {
      method: "POST", body: { password: newPassword, confirmPassword: newPassword },
    });
    assert.equal(reset.status, 200);
    assert.equal(typeof (await reset.json()).message, "string");
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

  it("does not expose reset tokens or URLs in production responses or logs", async () => {
    process.env.NODE_ENV = "production";
    const response = await request("/api/v1/auth/forgot-password", {
      method: "POST", body: { email },
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.resetToken, undefined);
    assert.equal(body.resetUrl, undefined);
    assert.match(storedUser.resetPasswordToken, /^[a-f0-9]{64}$/);
    assert.ok(!logLines.some((line) => /Password Reset Link:|\/reset-password\//.test(line)));
    const form = await request("/forgot-password", {
      method: "POST", html: true, body: { email },
    });
    assert.equal(form.status, 200);
    assert.doesNotMatch(await form.text(), /\/reset-password\/[a-f0-9]{64}/);
    assert.ok(!logLines.some((line) => /Password Reset Link:|\/reset-password\//.test(line)));
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
