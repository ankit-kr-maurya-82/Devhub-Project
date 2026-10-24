function parseMongoTarget(uri, variableName) {
  let parsed;
  try { parsed = new URL(uri); }
  catch { throw new Error(`${variableName} must be a valid MongoDB URI.`); }
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    throw new Error(`${variableName} must use mongodb:// or mongodb+srv://.`);
  }
  return {
    host: parsed.hostname.toLowerCase(),
    port: parsed.port || "27017",
    databaseName: decodeURIComponent(parsed.pathname.slice(1).split("/")[0] || "test"),
  };
}

export function resolveIndexCheckTarget(env) {
  const uri = env.TEST_MONGODB_URI;
  if (!uri) throw new Error("Set TEST_MONGODB_URI to a dedicated test or disposable database.");

  const target = parseMongoTarget(uri, "TEST_MONGODB_URI");
  if (!target.databaseName || !/(test|disposable)/i.test(target.databaseName) ||
      /(prod(uction)?|live|primary|main)/i.test(target.databaseName)) {
    throw new Error("Refusing to inspect a production-like database name; use a dedicated test or disposable database.");
  }

  const applicationUris = [env.MONGODB_URI, env.MONGO_URI].filter(Boolean);
  for (const applicationUri of applicationUris) {
    const applicationTarget = parseMongoTarget(applicationUri, "MONGODB_URI or MONGO_URI");
    if (applicationTarget.host === target.host &&
        applicationTarget.port === target.port &&
        applicationTarget.databaseName === target.databaseName) {
      throw new Error("Refusing to inspect a database matching the configured application target.");
    }
  }

  return { uri, ...target };
}

export async function compareDeclaredIndexes(models) {
  let hasDrift = false;
  const results = [];
  for (const Model of models) {
    const { toDrop, toCreate } = await Model.diffIndexes({ indexOptionsToCreate: true });
    if (toDrop.length || toCreate.length) hasDrift = true;
    results.push({ modelName: Model.modelName, toCreate, toDrop });
  }
  return { hasDrift, results };
}
