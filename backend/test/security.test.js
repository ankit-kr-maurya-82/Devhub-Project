import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { io as createClient } from "socket.io-client";
import { app } from "../src/app.js";
import initializeSocket from "../src/socket/socket.js";
import User from "../src/models/user.model.js";
import Question from "../src/models/question.model.js";
import Message from "../src/models/message.model.js";

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
  const otherRoomId = "507f1f77bcf86cd799439015";
  const missingParentId = "507f1f77bcf86cd799439016";
  const createdMessages = [];
  const parentMessages = new Map();

  before(async () => {
    process.env.JWT_SECRET = secret;
    mock.method(User, "findById", () => ({ select: async () => ({
      _id: new mongoose.Types.ObjectId(userId), name: "Reader", username: "reader", avatar: "", isActive: true,
      async save() {},
    }) }));
    const Room = (await import("../src/models/room.model.js")).default;
    mock.method(Room, "findById", (id) => ({ select: async () => ({
      _id: new mongoose.Types.ObjectId(id), members: [new mongoose.Types.ObjectId(userId)],
    }) }));
    const foreignParentId = new mongoose.Types.ObjectId();
    parentMessages.set(foreignParentId.toString(), { _id: foreignParentId, room: new mongoose.Types.ObjectId(otherRoomId) });
    mock.method(Message, "findById", (id) => ({ select: async () => parentMessages.get(id) ?? null }));
    mock.method(Message, "create", async (fields) => {
      createdMessages.push(fields);
      const message = {
        _id: new mongoose.Types.ObjectId(),
        ...fields,
        async populate() { return this; },
      };
      parentMessages.set(message._id.toString(), { _id: message._id, room: new mongoose.Types.ObjectId(fields.room) });
      return message;
    });
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

  it("sends normal messages and validates same-room replies", async () => {
    const joined = once(client, "roomJoined");
    client.emit("joinRoom", { roomId });
    await joined;

    const normalMessageEvent = once(client, "newMessage");
    client.emit("sendMessage", { roomId, content: "ordinary message" });
    const [normalMessage] = await normalMessageEvent;
    assert.equal(createdMessages.at(-1).replyTo, null);

    const emptyReplyMessage = once(client, "newMessage");
    client.emit("sendMessage", { roomId, content: "empty reply field", replyTo: "  " });
    await emptyReplyMessage;
    assert.equal(createdMessages.at(-1).replyTo, null);

    const replyMessage = once(client, "newMessage");
    client.emit("sendMessage", { roomId, content: "reply", replyTo: normalMessage._id.toString() });
    await replyMessage;
    assert.equal(createdMessages.at(-1).replyTo.toString(), normalMessage._id.toString());
  });

  it("rejects malformed reply IDs and messages from another room", async () => {
    const invalidReply = once(client, "socketError");
    client.emit("sendMessage", { roomId, content: "invalid reply", replyTo: "not-an-object-id" });
    assert.match((await invalidReply)[0].message, /Invalid replyTo message ID/);

    const missingReply = once(client, "socketError");
    client.emit("sendMessage", { roomId, content: "missing reply", replyTo: missingParentId });
    assert.match((await missingReply)[0].message, /Reply target message not found/);

    const foreignReply = once(client, "socketError");
    const foreignParentId = [...parentMessages.entries()].find(([, parent]) => parent.room.toString() === otherRoomId)[0];
    client.emit("sendMessage", { roomId, content: "foreign reply", replyTo: foreignParentId });
    assert.match((await foreignReply)[0].message, /same room/i);
  });
});
