import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";
import { createServer } from "node:http";
import { io as createClient } from "socket.io-client";
import { app } from "../src/app.js";
import initializeSocket from "../src/socket/socket.js";
import User from "../src/models/user.model.js";
import Question from "../src/models/question.model.js";

describe("HTTP security controls", { concurrency: false }, () => {
  let server;
  let baseUrl;
  const secret = "test-only-security-secret";
  const userId = "507f1f77bcf86cd799439011";
  const otherUserId = "507f191e810c19729de860ea";

  before(async () => {
    process.env.JWT_SECRET = secret;
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => {
    mock.restoreAll();
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("rejects missing, invalid, and expired JWTs", async () => {
    const expired = jwt.sign({ userId }, secret, { expiresIn: -1 });
    for (const authorization of [undefined, "Bearer invalid", `Bearer ${expired}`]) {
      const response = await fetch(`${baseUrl}/api/v1/auth/dashboard`, { headers: authorization ? { authorization } : {} });
      assert.equal(response.status, 401);
    }
  });

  it("rejects malformed MongoDB ObjectIds before querying", async () => {
    const response = await fetch(`${baseUrl}/api/v1/questions/not-an-object-id`);
    assert.equal(response.status, 400);
  });

  it("prevents another user from updating a question", async () => {
    mock.method(User, "findById", () => ({ select: async () => ({ _id: userId, isActive: true, username: "reader" }) }));
    mock.method(Question, "findById", async () => ({ _id: "507f1f77bcf86cd799439012", author: otherUserId }));
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });
    const response = await fetch(`${baseUrl}/api/v1/questions/507f1f77bcf86cd799439012`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "A changed question title" }),
    });
    assert.equal(response.status, 403);
  });

  it("rate limits repeated authentication requests", async () => {
    let last;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      last = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST", headers: { "content-type": "application/json" }, body: "{}",
      });
    }
    assert.equal(last.status, 429);
  });
});

describe("Socket.IO security controls", { concurrency: false }, () => {
  let httpServer;
  let ioServer;
  let client;
  const secret = "test-only-socket-secret";
  const userId = "507f1f77bcf86cd799439011";
  const roomId = "507f1f77bcf86cd799439012";

  before(async () => {
    process.env.JWT_SECRET = secret;
    mock.method(User, "findById", () => ({ select: async () => ({
      _id: userId, name: "Reader", username: "reader", avatar: "", isActive: true,
      async save() {},
    }) }));
    const Room = (await import("../src/models/room.model.js")).default;
    mock.method(Room, "findById", () => ({ select: async () => ({ _id: roomId, members: [] }) }));
    httpServer = createServer();
    ioServer = initializeSocket(httpServer);
    httpServer.listen(0, "127.0.0.1");
    await once(httpServer, "listening");
    client = createClient(`http://127.0.0.1:${httpServer.address().port}`, {
      auth: { token: jwt.sign({ userId }, secret, { expiresIn: "1h" }) },
      reconnection: false,
    });
    await once(client, "connect");
  });

  after(async () => {
    if (client) client.disconnect();
    if (ioServer) await new Promise((resolve) => ioServer.close(resolve));
    else if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    mock.restoreAll();
  });

  it("rejects invalid socket payloads and non-member message attempts", async () => {
    const errorEvent = once(client, "socketError");
    client.emit("sendMessage", { roomId: "bad-id", content: "hello" });
    assert.equal((await errorEvent)[0].success, false);

    const membershipError = once(client, "socketError");
    client.emit("sendMessage", { roomId, content: "hello" });
    assert.match((await membershipError)[0].message, /not a member/i);
  });
});
