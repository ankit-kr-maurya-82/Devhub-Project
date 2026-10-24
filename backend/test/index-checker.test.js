import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareDeclaredIndexes, resolveIndexCheckTarget, runIndexCheck } from "../src/db/index-checker.js";

describe("read-only index checker safeguards", () => {
  it("requires a dedicated test database URI", () => {
    assert.throws(() => resolveIndexCheckTarget({}), /Set TEST_MONGODB_URI/);
    assert.throws(() => resolveIndexCheckTarget({ TEST_MONGODB_URI: "mongodb://db.example/devhub_test" }), /TEST_MONGODB_ISOLATED=true/);
    assert.throws(() => resolveIndexCheckTarget({ TEST_MONGODB_URI: "not a MongoDB URI", TEST_MONGODB_ISOLATED: "true" }), /valid MongoDB URI/);
    assert.throws(() => resolveIndexCheckTarget({ TEST_MONGODB_URI: "https://db.example/devhub_test", TEST_MONGODB_ISOLATED: "true" }), /mongodb:\/\//);
  });

  it("rejects unsafe and production-like database names", () => {
    for (const databaseName of ["devhub", "devhub-production_test", "main-disposable"]) {
      assert.throws(
        () => resolveIndexCheckTarget({ TEST_MONGODB_URI: `mongodb://db.example/${databaseName}`, TEST_MONGODB_ISOLATED: "true" }),
        /Refusing to inspect/,
      );
    }
  });

  it("rejects the configured application database but permits a separate test database", () => {
    const appUri = "mongodb://db.example:27017/devhub_test";
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: appUri,
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test",
      TEST_MONGODB_ISOLATED: "true",
    }), /configured application target/);
    assert.throws(() => resolveIndexCheckTarget({
      MONGO_URI: appUri,
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test",
      TEST_MONGODB_ISOLATED: "true",
    }), /configured application target/);
    assert.equal(resolveIndexCheckTarget({
      MONGODB_URI: appUri,
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test2",
      TEST_MONGODB_ISOLATED: "true",
    }).databaseName, "devhub_test2");
  });

  it("accepts disposable Atlas URIs and defaults the application URI database to test", () => {
    const target = resolveIndexCheckTarget({
      MONGO_URI: "mongodb+srv://cluster.example/devhub",
      TEST_MONGODB_URI: "mongodb+srv://cluster.example/devhub_disposable",
      TEST_MONGODB_ISOLATED: "true",
    });
    assert.equal(target.databaseName, "devhub_disposable");
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: "mongodb://db.example",
      TEST_MONGODB_URI: "mongodb://db.example/test",
      TEST_MONGODB_ISOLATED: "true",
    }), /configured application target/);
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: "mongodb://db.example/devhub_test",
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test",
      TEST_MONGODB_ISOLATED: "true",
    }), /configured application target/);
  });
});

describe("read-only index comparison", () => {
  it("reports clean and drifted models by calling only diffIndexes", async () => {
    const calls = [];
    const cleanModel = {
      modelName: "Clean",
      async diffIndexes(options) { calls.push(["Clean", options]); return { toCreate: [], toDrop: [] }; },
      createIndexes() { assert.fail("must not create indexes"); },
      syncIndexes() { assert.fail("must not synchronize indexes"); },
    };
    const driftedModel = {
      modelName: "Drifted",
      async diffIndexes(options) { calls.push(["Drifted", options]); return { toCreate: ["missing_1"], toDrop: ["stale_1"] }; },
      createIndexes() { assert.fail("must not create indexes"); },
      syncIndexes() { assert.fail("must not synchronize indexes"); },
    };

    const clean = await compareDeclaredIndexes([cleanModel]);
    const drifted = await compareDeclaredIndexes([driftedModel]);

    assert.equal(clean.hasDrift, false);
    assert.deepEqual(clean.results, [{ modelName: "Clean", toCreate: [], toDrop: [] }]);
    assert.equal(drifted.hasDrift, true);
    assert.deepEqual(drifted.results, [{ modelName: "Drifted", toCreate: ["missing_1"], toDrop: ["stale_1"] }]);
    assert.deepEqual(calls, [
      ["Clean", { indexOptionsToCreate: true }],
      ["Drifted", { indexOptionsToCreate: true }],
    ]);
  });

  it("fails closed on connection failure without comparing indexes or disconnecting", async () => {
    const events = [];
    const logger = { log() {}, error: (message) => events.push(message) };
    const mongoose = {
      set: (...args) => events.push(["set", ...args]),
      connect: async (...args) => { events.push(["connect", ...args]); throw new Error("private connection details"); },
      disconnect: async () => events.push(["disconnect"]),
    };
    const model = { modelName: "NeverCalled", diffIndexes: async () => assert.fail("must not compare after failed connect") };

    const result = await runIndexCheck({
      mongoose,
      models: [model],
      target: { uri: "mongodb://isolated.invalid/devhub_test", databaseName: "devhub_test" },
      logger,
    });

    assert.equal(result, 1);
    assert.deepEqual(events, [
      ["set", "autoIndex", false],
      ["connect", "mongodb://isolated.invalid/devhub_test", { autoIndex: false, serverSelectionTimeoutMS: 10_000 }],
      "Index comparison failed. No index changes were attempted.",
    ]);
    assert.ok(!events.some((event) => String(event).includes("private connection details")));
  });

  it("disconnects after comparisons and fails if comparison or cleanup fails", async () => {
    const events = [];
    const logger = { log() {}, error: (message) => events.push(message) };
    const mongoose = {
      set() {},
      connect: async () => { events.push("connect"); },
      disconnect: async () => { events.push("disconnect"); throw new Error("private cleanup details"); },
    };
    const model = { modelName: "Broken", diffIndexes: async () => { throw new Error("private index details"); } };

    const result = await runIndexCheck({
      mongoose,
      models: [model],
      target: { uri: "mongodb://isolated.invalid/devhub_test", databaseName: "devhub_test" },
      logger,
    });

    assert.equal(result, 1);
    assert.deepEqual(events, [
      "connect",
      "Index comparison failed. No index changes were attempted.",
      "disconnect",
      "Index comparison cleanup failed while disconnecting.",
    ]);
  });

  it("returns success on a clean comparison and disconnects", async () => {
    const events = [];
    const logger = { log: (message) => events.push(message), error: (message) => events.push(message) };
    const mongoose = {
      set: (...args) => events.push(["set", ...args]),
      connect: async () => events.push("connect"),
      disconnect: async () => events.push("disconnect"),
    };
    const model = {
      modelName: "Clean",
      diffIndexes: async () => ({ toCreate: [], toDrop: [] }),
    };

    const result = await runIndexCheck({
      mongoose,
      models: [model],
      target: { uri: "mongodb://isolated.invalid/devhub_test", databaseName: "devhub_test" },
      logger,
    });

    assert.equal(result, 0);
    assert.equal(events[0][0], "set");
    assert.equal(events.includes("connect"), true);
    assert.equal(events.includes("disconnect"), true);
    assert.ok(events.includes("Declared and database indexes match. No indexes were changed."));
  });

  it("returns nonzero for index drift and disconnects without applying it", async () => {
    const events = [];
    const logger = { log: (message) => events.push(message), error: (message) => events.push(message) };
    const mongoose = {
      set() {},
      connect: async () => events.push("connect"),
      disconnect: async () => events.push("disconnect"),
    };
    const model = {
      modelName: "Drifted",
      diffIndexes: async () => ({ toCreate: ["missing_1"], toDrop: ["stale_1"] }),
      createIndexes: () => assert.fail("must not create indexes"),
      syncIndexes: () => assert.fail("must not synchronize indexes"),
    };

    const result = await runIndexCheck({
      mongoose,
      models: [model],
      target: { uri: "mongodb://isolated.invalid/devhub_test", databaseName: "devhub_test" },
      logger,
    });

    assert.equal(result, 1);
    assert.deepEqual(events, [
      "connect",
      "Read-only index comparison for test database 'devhub_test'.",
      'Drifted: {"toCreate":["missing_1"],"toDrop":["stale_1"]}',
      "Index differences found. This command did not create or drop indexes.",
      "disconnect",
    ]);
  });
});
