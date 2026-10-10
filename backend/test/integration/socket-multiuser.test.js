import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { io as createClient } from "socket.io-client";
import User from "../../src/models/user.model.js";
import Room from "../../src/models/room.model.js";
import Message from "../../src/models/message.model.js";
import { app } from "../../src/app.js";
import initializeSocket from "../../src/socket/socket.js";
import "../../src/db/index.js"; // Apply the backend's configured DNS resolver.

const TEST_JWT_SECRET = "devhub-isolated-socket-test-secret";
const TIMEOUT_MS = 8_000;
const idOf = (value) => String(value?._id ?? value);

const databaseName = (uri) => decodeURIComponent(new URL(uri).pathname.slice(1));

const waitForEvent = (socket, eventName, { rejectOnSocketError = true } = {}) => new Promise((resolve, reject) => {
  const cleanup = () => {
    clearTimeout(timer);
    socket.off(eventName, onEvent);
    socket.off("socketError", onSocketError);
  };
  const onEvent = (...args) => { cleanup(); resolve(args); };
  const onSocketError = (error) => {
    if (!rejectOnSocketError || eventName === "socketError") return;
    cleanup();
    reject(new Error(`Socket error before ${eventName}: ${error.message}`));
  };
  const timer = setTimeout(() => {
    cleanup();
    reject(new Error(`Timed out waiting for Socket.IO event "${eventName}" after ${TIMEOUT_MS}ms`));
  }, TIMEOUT_MS);
  socket.once(eventName, onEvent);
  if (rejectOnSocketError && eventName !== "socketError") socket.once("socketError", onSocketError);
});

const connectClient = (serverUrl, token) => new Promise((resolve, reject) => {
  const socket = createClient(serverUrl, {
    auth: token ? { token } : {},
    reconnection: false,
    timeout: TIMEOUT_MS,
  });
  const timer = setTimeout(() => {
    socket.close();
    reject(new Error(`Timed out connecting to ${serverUrl}`));
  }, TIMEOUT_MS);
  socket.once("connect", () => { clearTimeout(timer); resolve(socket); });
  socket.once("connect_error", (error) => { clearTimeout(timer); socket.close(); resolve({ socket, error }); });
});

const disconnectClient = async (socket) => {
  if (!socket) return;
  if (socket.connected) {
    const disconnected = waitForEvent(socket, "disconnect", { rejectOnSocketError: false });
    socket.disconnect();
    await disconnected;
  } else {
    socket.disconnect();
  }
};

describe("multi-user Socket.IO chat integration", { concurrency: false }, () => {
  let connectedToDatabase = false;
  let httpServer;
  let ioServer;
  let serverUrl;
  const originalJwtSecret = process.env.JWT_SECRET;
  const clients = new Set();
  const createdUserIds = [];
  let createdRoomId;
  const testContents = [];

  before(async () => {
    const testMongoUri = process.env.TEST_MONGODB_URI;
    assert.ok(testMongoUri, "Set TEST_MONGODB_URI to a dedicated database such as mongodb://127.0.0.1:27017/devhub_test");
    const testDbName = databaseName(testMongoUri);
    assert.match(testDbName, /test/i, "Refusing to use a MongoDB database whose name does not include 'test'");
    if (process.env.MONGODB_URI) {
      assert.notEqual(testDbName, databaseName(process.env.MONGODB_URI), "TEST_MONGODB_URI must not target the normal MONGODB_URI database");
    }
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    await mongoose.connect(testMongoUri, { serverSelectionTimeoutMS: TIMEOUT_MS });
    connectedToDatabase = true;

    httpServer = createServer(app);
    ioServer = initializeSocket(httpServer);
    httpServer.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      httpServer.once("listening", resolve);
      httpServer.once("error", reject);
    });
    serverUrl = `http://localhost:${httpServer.address().port}`;
  });

  after(async () => {
    for (const client of clients) await disconnectClient(client);
    if (ioServer) await new Promise((resolve) => ioServer.close(resolve));
    else if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
    if (connectedToDatabase) {
      if (createdRoomId) {
        const testMessages = await Message.find({ room: createdRoomId, content: { $in: testContents } }).select("_id").lean();
        const messageIds = testMessages.map((message) => message._id);
        if (messageIds.length) await Message.deleteMany({ _id: { $in: messageIds }, room: createdRoomId });
        await Room.deleteOne({ _id: createdRoomId });
      }
      if (createdUserIds.length) await User.deleteMany({ _id: { $in: createdUserIds } });
      await mongoose.disconnect();
    }
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  it("joins two members, broadcasts and persists messages/replies/reactions, and rejects unauthorized clients", async () => {
    const suffix = randomUUID();
    const passwordHash = await bcrypt.hash(randomUUID(), 4);
    const userA = await User.create({
      name: "Socket Test A", username: `socka_${suffix.slice(0, 12)}`,
      email: `socka_${suffix}@example.invalid`, password: passwordHash, isActive: true,
    });
    createdUserIds.push(userA._id);
    const userB = await User.create({
      name: "Socket Test B", username: `sockb_${suffix.slice(0, 12)}`,
      email: `sockb_${suffix}@example.invalid`, password: passwordHash, isActive: true,
    });
    createdUserIds.push(userB._id);
    const nonMember = await User.create({
      name: "Socket Test Nonmember", username: `sockc_${suffix.slice(0, 12)}`,
      email: `sockc_${suffix}@example.invalid`, password: passwordHash, isActive: true,
    });
    createdUserIds.push(nonMember._id);

    const room = await Room.create({
      name: `Socket test ${suffix.slice(0, 8)}`,
      description: "Temporary multi-user integration test room",
      owner: userA._id,
      members: [userA._id, userB._id],
      isPublic: false,
      maxMembers: 3,
    });
    createdRoomId = room._id;

    const tokenA = jwt.sign({ userId: userA._id.toString() }, TEST_JWT_SECRET, { expiresIn: "5m" });
    const tokenB = jwt.sign({ userId: userB._id.toString() }, TEST_JWT_SECRET, { expiresIn: "5m" });
    const tokenNonMember = jwt.sign({ userId: nonMember._id.toString() }, TEST_JWT_SECRET, { expiresIn: "5m" });

    const clientAResult = await connectClient(serverUrl, tokenA);
    assert.ok(!clientAResult.error, `User A connection failed: ${clientAResult.error?.message}`);
    const clientA = clientAResult;
    clients.add(clientA);
    const clientBResult = await connectClient(serverUrl, tokenB);
    assert.ok(!clientBResult.error, `User B connection failed: ${clientBResult.error?.message}`);
    const clientB = clientBResult;
    clients.add(clientB);

    const joinedA = waitForEvent(clientA, "roomJoined");
    const joinedB = waitForEvent(clientB, "roomJoined");
    clientA.emit("joinRoom", { roomId: room._id.toString() });
    clientB.emit("joinRoom", { roomId: room._id.toString() });
    assert.equal(idOf((await joinedA)[0].roomId), room._id.toString());
    assert.equal(idOf((await joinedB)[0].roomId), room._id.toString());

    const parentContent = `multi-user-parent-${suffix}`;
    testContents.push(parentContent);
    const parentFromA = waitForEvent(clientA, "newMessage");
    const parentFromB = waitForEvent(clientB, "newMessage");
    clientA.emit("sendMessage", { roomId: room._id.toString(), content: parentContent, messageType: "text" });
    const [parentA] = await parentFromA;
    const [parentB] = await parentFromB;
    assert.equal(parentA.content, parentContent);
    assert.equal(parentB.content, parentContent);
    assert.equal(idOf(parentA._id), idOf(parentB._id));
    assert.equal(idOf(parentA.room), room._id.toString());
    assert.equal(idOf(parentA.sender), userA._id.toString());

    const savedParent = await Message.findById(parentA._id).lean();
    assert.ok(savedParent, "parent message is persisted in MongoDB");
    assert.equal(savedParent.room.toString(), room._id.toString());
    assert.equal(savedParent.sender.toString(), userA._id.toString());

    const replyContent = `multi-user-reply-${suffix}`;
    testContents.push(replyContent);
    const replyFromA = waitForEvent(clientA, "newMessage");
    const replyFromB = waitForEvent(clientB, "newMessage");
    clientB.emit("sendMessage", {
      roomId: room._id.toString(), content: replyContent, messageType: "text", replyTo: savedParent._id.toString(),
    });
    const [replyA] = await replyFromA;
    const [replyB] = await replyFromB;
    assert.equal(replyA.content, replyContent);
    assert.equal(replyB.content, replyContent);
    assert.equal(idOf(replyA._id), idOf(replyB._id));
    assert.equal(idOf(replyA.room), room._id.toString());
    assert.equal(idOf(replyA.sender), userB._id.toString());
    assert.equal(idOf(replyA.replyTo), savedParent._id.toString());
    assert.equal(idOf(replyB.replyTo), savedParent._id.toString());
    const savedReply = await Message.findById(replyA._id).lean();
    assert.equal(savedReply.replyTo.toString(), savedParent._id.toString());
    assert.equal(savedReply.sender.toString(), userB._id.toString());

    const reactionFromA = waitForEvent(clientA, "messageReactionUpdated");
    const reactionFromB = waitForEvent(clientB, "messageReactionUpdated");
    clientA.emit("reactToMessage", { messageId: replyA._id.toString(), emoji: "👍" });
    const [reactionA] = await reactionFromA;
    const [reactionB] = await reactionFromB;
    for (const reaction of [reactionA, reactionB]) {
      assert.equal(idOf(reaction.messageId), idOf(replyA._id));
      assert.equal(idOf(reaction.roomId), room._id.toString());
      assert.ok(reaction.reactions.some((entry) => idOf(entry.user) === userA._id.toString() && entry.emoji === "👍"));
    }
    const savedReactionMessage = await Message.findById(replyA._id).lean();
    assert.ok(savedReactionMessage.reactions.some((entry) => entry.user.toString() === userA._id.toString() && entry.emoji === "👍"));

    const unauthenticated = await connectClient(serverUrl, null);
    assert.ok(unauthenticated.error, "connection without a JWT must be rejected");
    assert.match(unauthenticated.error.message, /authentication/i);
    unauthenticated.socket.close();

    const nonMemberResult = await connectClient(serverUrl, tokenNonMember);
    assert.ok(!nonMemberResult.error, `Non-member should authenticate: ${nonMemberResult.error?.message}`);
    const nonMemberSocket = nonMemberResult;
    clients.add(nonMemberSocket);
    const nonMemberError = waitForEvent(nonMemberSocket, "socketError", { rejectOnSocketError: false });
    nonMemberSocket.emit("sendMessage", { roomId: room._id.toString(), content: `unauthorized-${suffix}` });
    assert.match((await nonMemberError)[0].message, /not a member/i);
    assert.equal(await Message.countDocuments({ room: room._id, content: `unauthorized-${suffix}` }), 0);
  });
});
