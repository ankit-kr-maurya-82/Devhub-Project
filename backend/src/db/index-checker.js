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
  if (env.TEST_MONGODB_ISOLATED !== "true") {
    throw new Error("Set TEST_MONGODB_ISOLATED=true only after verifying the instance and credentials are dedicated to disposable test data.");
  }

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

export async function runIndexCheck({ mongoose, models, target, logger = console }) {
  let connected = false;
  let exitCode = 0;
  mongoose.set("autoIndex", false);

  try {
    await mongoose.connect(target.uri, { autoIndex: false, serverSelectionTimeoutMS: 10_000 });
    connected = true;
    logger.log(`Read-only index comparison for test database '${target.databaseName}'.`);
    const { hasDrift, results } = await compareDeclaredIndexes(models);
    for (const { modelName, toCreate, toDrop } of results) {
      logger.log(`${modelName}: ${JSON.stringify({ toCreate, toDrop })}`);
    }
    if (hasDrift) {
      logger.error("Index differences found. This command did not create or drop indexes.");
      exitCode = 1;
    } else {
      logger.log("Declared and database indexes match. No indexes were changed.");
    }
  } catch {
    logger.error("Index comparison failed. No index changes were attempted.");
    exitCode = 1;
  }

  if (connected) {
    try {
      await mongoose.disconnect();
    } catch {
      logger.error("Index comparison cleanup failed while disconnecting.");
      exitCode = 1;
    }
  }

  return exitCode;
}
