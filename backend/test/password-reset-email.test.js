import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPasswordResetUrl,
  PasswordResetEmailError,
  sendPasswordResetEmail,
  validatePasswordResetEmailConfig,
} from "../src/services/passwordResetEmail.service.js";

const token = "a".repeat(64);
const validEnv = {
  NODE_ENV: "production",
  RESEND_API_KEY: "re_test_key_123456789",
  PASSWORD_RESET_FROM: "DevHub <no-reply@example.com>",
  CLIENT_ORIGIN: "https://app.example.com,https://admin.example.com",
};

describe("password reset email service", () => {
  it("validates configuration and rejects missing or unsafe values", () => {
    assert.deepEqual(validatePasswordResetEmailConfig(validEnv), {
      apiKey: validEnv.RESEND_API_KEY,
      sender: validEnv.PASSWORD_RESET_FROM,
      frontendOrigin: "https://app.example.com",
      nodeEnv: "production",
    });
    for (const env of [
      { ...validEnv, RESEND_API_KEY: "" },
      { ...validEnv, RESEND_API_KEY: "not-a-resend-key" },
      { ...validEnv, PASSWORD_RESET_FROM: "DevHub <no-reply@example.com>\r\nBcc: victim@example.com" },
      { ...validEnv, PASSWORD_RESET_FROM: "not-an-email" },
      { ...validEnv, CLIENT_ORIGIN: "https://app.example.com/path" },
      { ...validEnv, CLIENT_ORIGIN: "http://app.example.com" },
      { ...validEnv, CLIENT_ORIGIN: "*" },
    ]) {
      assert.throws(() => validatePasswordResetEmailConfig(env), /Password reset email requires/);
    }
    assert.equal(validatePasswordResetEmailConfig({
      ...validEnv,
      NODE_ENV: "development",
      CLIENT_ORIGIN: "http://localhost:5173",
    }).frontendOrigin, "http://localhost:5173");
    assert.throws(() => validatePasswordResetEmailConfig({
      ...validEnv,
      NODE_ENV: "development",
      CLIENT_ORIGIN: "http://localhost:5173",
      RESEND_API_KEY: "",
    }), /Password reset email requires/);
  });

  it("creates an encoded reset URL using the validated frontend origin", () => {
    assert.equal(
      createPasswordResetUrl(token, "https://app.example.com"),
      `https://app.example.com/reset-password/${token}`,
    );
    assert.throws(() => createPasswordResetUrl("bad token", "https://app.example.com"), /token is invalid/);
    assert.throws(() => createPasswordResetUrl(token, "https://app.example.com/path"), /origin is invalid/);
  });

  it("sends the documented Resend request and reports acceptance", async () => {
    const config = validatePasswordResetEmailConfig(validEnv);
    const resetUrl = createPasswordResetUrl(token, config.frontendOrigin);
    let request;
    const result = await sendPasswordResetEmail({
      recipient: "reader@example.com",
      resetUrl,
      config,
      fetchImpl: async (url, options) => {
        request = { url, options };
        return { ok: true, status: 200 };
      },
    });

    assert.deepEqual(result, { accepted: true });
    assert.equal(request.url, "https://api.resend.com/emails");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, `Bearer ${validEnv.RESEND_API_KEY}`);
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.equal(request.options.redirect, "error");
    const payload = JSON.parse(request.options.body);
    assert.deepEqual(payload, {
      from: validEnv.PASSWORD_RESET_FROM,
      to: ["reader@example.com"],
      subject: "Reset your DevHub password",
      text: `Use this link to reset your DevHub password. It expires in one hour: ${resetUrl}`,
      html: `<p>Use this link to reset your DevHub password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
    });
    assert.equal(request.options.signal.aborted, false);
  });

  it("does not report acceptance for provider HTTP errors or network failures", async () => {
    const config = validatePasswordResetEmailConfig(validEnv);
    const resetUrl = createPasswordResetUrl(token, config.frontendOrigin);
    for (const response of [{ ok: false, status: 401 }, { ok: false, status: 500 }]) {
      await assert.rejects(
        sendPasswordResetEmail({
          recipient: "reader@example.com",
          resetUrl,
          config,
          fetchImpl: async () => response,
        }),
        (error) => error instanceof PasswordResetEmailError && error.reason === "provider_rejected",
      );
    }
    await assert.rejects(
      sendPasswordResetEmail({
        recipient: "reader@example.com",
        resetUrl,
        config,
        fetchImpl: async () => { throw new Error("sensitive transport detail"); },
      }),
      (error) => error instanceof PasswordResetEmailError && error.reason === "network" &&
        !error.message.includes("sensitive"),
    );
  });

  it("aborts timed-out provider requests without exposing transport details", async () => {
    const config = validatePasswordResetEmailConfig(validEnv);
    const resetUrl = createPasswordResetUrl(token, config.frontendOrigin);
    const keepAlive = setTimeout(() => {}, 50);
    try {
      await assert.rejects(
        sendPasswordResetEmail({
          recipient: "reader@example.com",
          resetUrl,
          config,
          timeoutMs: 5,
          fetchImpl: (_url, { signal }) => new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
          }),
        }),
        (error) => error instanceof PasswordResetEmailError && error.reason === "timeout",
      );
    } finally {
      clearTimeout(keepAlive);
    }
  });

  it("rejects malformed recipients, sender configuration, and reset URLs before fetching", async () => {
    const config = validatePasswordResetEmailConfig(validEnv);
    const fetchImpl = async () => {
      assert.fail("invalid email inputs must not reach the provider");
    };
    await assert.rejects(sendPasswordResetEmail({
      recipient: "bad\r\nBcc: victim@example.com",
      resetUrl: createPasswordResetUrl(token, config.frontendOrigin),
      config,
      fetchImpl,
    }), /recipient is invalid/);
    await assert.rejects(sendPasswordResetEmail({
      recipient: "reader@example.com",
      resetUrl: createPasswordResetUrl(token, config.frontendOrigin),
      config: { ...config, sender: "bad sender" },
      fetchImpl,
    }), /configuration is invalid/);
    await assert.rejects(sendPasswordResetEmail({
      recipient: "reader@example.com",
      resetUrl: "https://app.example.com.evil/reset-password/" + token,
      config,
      fetchImpl,
    }), /URL is invalid/);
  });
});
