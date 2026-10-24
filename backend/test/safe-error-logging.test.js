import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { afterEach, describe, it } from "node:test";
import { logSafeError } from "../src/utils/logSafeError.js";

const originalConsoleError = console.error;

afterEach(() => {
  console.error = originalConsoleError;
});

describe("safe error logging", () => {
  it("logs context and error type without message, stack, cause, or attached values", () => {
    const captured = [];
    console.error = (...args) => captured.push(args);
    const error = new Error("reset token, complete reset URL, password, and Mongo URI");
    error.value = "sensitive user submitted content";
    error.cause = new Error("provider key or connection string");

    logSafeError("Request failed", error);

    assert.deepEqual(captured, [["Request failed", { errorType: "Error" }]]);
    assert.equal(JSON.stringify(captured).includes("reset token"), false);
    assert.equal(JSON.stringify(captured).includes("sensitive user"), false);
    assert.equal(JSON.stringify(captured).includes("provider key"), false);
  });

  it("uses a fixed error type for non-Error values and unsafe names", () => {
    const captured = [];
    console.error = (...args) => captured.push(args);
    const error = new Error("details");
    error.name = "MongoError: mongodb://user:password@host/db";

    logSafeError("Database request failed", error);
    logSafeError("Request failed", "password=secret");

    assert.deepEqual(captured, [
      ["Database request failed", { errorType: "Error" }],
      ["Request failed", { errorType: "Error" }],
    ]);
  });

  it("routes controller, auth-middleware, and Socket.IO exceptions through safe logging", async () => {
    const directories = [
      new URL("../src/controllers/", import.meta.url),
      new URL("../src/middlewares/", import.meta.url),
      new URL("../src/socket/", import.meta.url),
    ];

    for (const directory of directories) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
        const source = await readFile(new URL(entry.name, directory), "utf8");
        assert.doesNotMatch(source, /console\.error\([^\n]*,\s*error\s*\)/, entry.name);
        assert.doesNotMatch(source, /console\.error\(error\)/, entry.name);
      }
    }
  });
});
