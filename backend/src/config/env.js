const validateOrigins = (value, isProduction) => {
  const origins = (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (isProduction && origins.length === 0) {
    throw new Error("Production startup requires CLIENT_ORIGIN.");
  }

  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("CLIENT_ORIGIN must contain comma-separated origin URLs.");
    }
    if (
      origin === "*" ||
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error("CLIENT_ORIGIN entries must be explicit HTTP(S) origins without paths or credentials.");
    }
  }

  return origins;
};

const validateEnvironment = (env = process.env) => {
  const rawPort = env.PORT ?? "4000";
  if (typeof rawPort !== "string" || !/^\d{1,5}$/.test(rawPort)) {
    throw new Error("PORT must be an integer from 1 to 65535.");
  }
  const port = Number(rawPort);
  if (port < 1 || port > 65535) throw new Error("PORT must be an integer from 1 to 65535.");

  if (env.MONGODB_URI && env.MONGO_URI && env.MONGODB_URI !== env.MONGO_URI) {
    throw new Error("Set only one of MONGODB_URI or MONGO_URI, or give them the same value.");
  }
  const mongoUri = env.MONGODB_URI || env.MONGO_URI;
  if (typeof mongoUri !== "string" || !/^mongodb(?:\+srv)?:\/\/[^/?#]+(?:\/[^?#]*)?(?:\?[^#]*)?$/i.test(mongoUri)) {
    throw new Error("Startup requires a valid MONGODB_URI or MONGO_URI.");
  }

  if (typeof env.JWT_SECRET !== "string" || !env.JWT_SECRET) {
    throw new Error("Startup requires JWT_SECRET.");
  }
  if (env.NODE_ENV === "production" && (
    env.JWT_SECRET.trim().length < 32 ||
    env.JWT_SECRET === "replace_with_a_long_random_secret"
  )) {
    throw new Error("Production JWT_SECRET must be a non-placeholder secret of at least 32 characters.");
  }

  const allowedOrigins = validateOrigins(env.CLIENT_ORIGIN, env.NODE_ENV === "production");
  return { port, mongoUri, allowedOrigins };
};

export { validateEnvironment };
