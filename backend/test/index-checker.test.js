import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareDeclaredIndexes, resolveIndexCheckTarget } from "../src/db/index-checker.js";

describe("read-only index checker safeguards", () => {
  it("requires a dedicated test database URI", () => {
    assert.throws(() => resolveIndexCheckTarget({}), /Set TEST_MONGODB_URI/);
    assert.throws(() => resolveIndexCheckTarget({ TEST_MONGODB_URI: "not a MongoDB URI" }), /valid MongoDB URI/);
    assert.throws(() => resolveIndexCheckTarget({ TEST_MONGODB_URI: "https://db.example/devhub_test" }), /mongodb:\/\//);
  });

  it("rejects unsafe and production-like database names", () => {
    for (const databaseName of ["devhub", "devhub-production_test", "main-disposable"]) {
      assert.throws(
        () => resolveIndexCheckTarget({ TEST_MONGODB_URI: `mongodb://db.example/${databaseName}` }),
        /Refusing to inspect/,
      );
    }
  });

  it("rejects the configured application database but permits a separate test database", () => {
    const appUri = "mongodb://db.example:27017/devhub_test";
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: appUri,
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test",
    }), /configured application target/);
    assert.equal(resolveIndexCheckTarget({
      MONGODB_URI: appUri,
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test2",
    }).databaseName, "devhub_test2");
  });

  it("accepts disposable Atlas URIs and defaults the application URI database to test", () => {
    const target = resolveIndexCheckTarget({
      MONGO_URI: "mongodb+srv://cluster.example/devhub",
      TEST_MONGODB_URI: "mongodb+srv://cluster.example/devhub_disposable",
    });
    assert.equal(target.databaseName, "devhub_disposable");
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: "mongodb://db.example",
      TEST_MONGODB_URI: "mongodb://db.example/test",
    }), /configured application target/);
    assert.throws(() => resolveIndexCheckTarget({
      MONGODB_URI: "mongodb://db.example/devhub_test",
      TEST_MONGODB_URI: "mongodb://db.example:27017/devhub_test",
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
});
