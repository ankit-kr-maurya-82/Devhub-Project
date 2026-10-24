const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TIMEOUT_MS = 10_000;
const EMAIL_LOCAL_PART = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

export class PasswordResetEmailError extends Error {
  constructor(reason) {
    super("Password reset email delivery failed.");
    this.name = "PasswordResetEmailError";
    this.reason = reason;
  }
}

const isValidEmailAddress = (value) => {
  if (typeof value !== "string" || value.length > 254) return false;
  const separator = value.lastIndexOf("@");
  if (separator < 1 || separator === value.length - 1) return false;
  const localPart = value.slice(0, separator);
  const domain = value.slice(separator + 1);
  return EMAIL_LOCAL_PART.test(localPart) &&
    localPart.length <= 64 &&
    domain.length <= 253 &&
    domain.split(".").length >= 2 &&
    domain.split(".").every((label) => EMAIL_DOMAIN_LABEL.test(label));
};

const isValidSender = (value) => {
  if (typeof value !== "string" || value.length > 320 || /[\r\n]/.test(value)) return false;
  const sender = value.trim();
  const match = /^(?:([^<>]+)\s*<([^<>]+)>|([^<>]+))$/.exec(sender);
  if (!match) return false;
  const displayName = match[1]?.trim();
  if (match[1] !== undefined && !displayName) return false;
  return isValidEmailAddress(match[2] || match[3]?.trim());
};

const parseOrigin = (value, isProduction) => {
  let origin;
  try {
    origin = new URL(value);
  } catch {
    return false;
  }
  return value !== "*" &&
    ["http:", "https:"].includes(origin.protocol) &&
    (!isProduction || origin.protocol === "https:") &&
    origin.origin === value &&
    !origin.username &&
    !origin.password;
};

export function validatePasswordResetEmailConfig(env = process.env) {
  if (!["development", "test", "production"].includes(env.NODE_ENV)) {
    throw new Error("Password reset email requires a supported NODE_ENV.");
  }
  const apiKey = typeof env.RESEND_API_KEY === "string" ? env.RESEND_API_KEY.trim() : "";
  const sender = typeof env.PASSWORD_RESET_FROM === "string" ? env.PASSWORD_RESET_FROM.trim() : "";
  const origins = typeof env.CLIENT_ORIGIN === "string"
    ? env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

  if (!/^re_[A-Za-z0-9_-]{10,}$/.test(apiKey)) {
    throw new Error("Password reset email requires a valid RESEND_API_KEY.");
  }
  if (!isValidSender(sender)) {
    throw new Error("Password reset email requires a valid PASSWORD_RESET_FROM sender.");
  }
  if (!origins.length || origins.some((origin) => !parseOrigin(origin, env.NODE_ENV === "production"))) {
    throw new Error("Password reset email requires valid CLIENT_ORIGIN entries.");
  }

  return { apiKey, sender, frontendOrigin: origins[0], nodeEnv: env.NODE_ENV };
}

export function createPasswordResetUrl(token, frontendOrigin) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Password reset token is invalid.");
  }
  if (!parseOrigin(frontendOrigin, false)) {
    throw new Error("Password reset frontend origin is invalid.");
  }
  return new URL(`/reset-password/${encodeURIComponent(token)}`, frontendOrigin).href;
}

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

export async function sendPasswordResetEmail({
  recipient,
  resetUrl,
  config,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (!isValidEmailAddress(recipient)) {
    throw new Error("Password reset recipient is invalid.");
  }
  if (!config || !/^re_[A-Za-z0-9_-]{10,}$/.test(config.apiKey || "") ||
      !isValidSender(config.sender) ||
      !["development", "test", "production"].includes(config.nodeEnv) ||
      !parseOrigin(config.frontendOrigin, config.nodeEnv === "production")) {
    throw new Error("Password reset email configuration is invalid.");
  }
  let parsedResetUrl;
  try {
    parsedResetUrl = new URL(resetUrl);
  } catch {
    throw new Error("Password reset URL is invalid.");
  }
  if (
    parsedResetUrl.origin !== config.frontendOrigin ||
    !/^\/reset-password\/[a-f0-9]{64}$/.test(parsedResetUrl.pathname) ||
    parsedResetUrl.search ||
    parsedResetUrl.hash
  ) {
    throw new Error("Password reset URL is invalid.");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Password reset email transport is unavailable.");
  }

  const signal = AbortSignal.timeout(timeoutMs);
  let response;
  try {
    response = await fetchImpl(RESEND_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      redirect: "error",
      signal,
      body: JSON.stringify({
        from: config.sender,
        to: [recipient],
        subject: "Reset your DevHub password",
        text: `Use this link to reset your DevHub password. It expires in one hour: ${resetUrl}`,
        html: `<p>Use this link to reset your DevHub password. It expires in one hour.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p>`,
      }),
    });
  } catch {
    throw new PasswordResetEmailError(signal.aborted ? "timeout" : "network");
  }

  if (!response?.ok) {
    throw new PasswordResetEmailError("provider_rejected");
  }
  return { accepted: true };
}
