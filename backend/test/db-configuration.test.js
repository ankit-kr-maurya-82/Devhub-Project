import assert from "node:assert/strict";
import dns from "node:dns";
import { it } from "node:test";

it("leaves Node's configured DNS servers unchanged when loading the MongoDB connector", async () => {
  const configuredServers = dns.getServers();

  await import("../src/db/index.js");

  assert.deepEqual(dns.getServers(), configuredServers);
});
