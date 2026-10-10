import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { io as createClient } from "socket.io-client";
import User from "../../src/models/user.model.js";
import Room from "../../src/models/room.model.js";
import Message from "../../src/models/message.model.js";
import "../../src/db/index.js"; // Apply the backend's configured DNS resolver.

const SERVER_URL = "http://localhost:4000";
const TIMEOUT_MS = 8_000;
const idOf = (value) => String(value?._id ?? value);

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

const connectClient = (token) => new Promise((resolve, reject) => {
  const socket = createClient(SERVER_URL, {
    auth: token ? { token } : {},
    reconnection: false,
    timeout: TIMEOUT_MS,
  });
  const timer = setTimeout(() => {
    socket.close();
    reject(new Error(`Timed out connecting to ${SERVER_URL}`));
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
  const clients = new Set();
  const createdUserIds = [];
  let createdRoomId;
  const testContents = [];

  before(async () => {
    assert.ok(process.env.MONGODB_URI, "MONGODB_URI must be configured (for example in backend/.env)");
    assert.ok(process.env.JWT_SECRET, "JWT_SECRET must be configured (for example in backend/.env)");
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: TIMEOUT_MS });
    connectedToDatabase = true;
  });

  after(async () => {
    for (const client of clients) await disconnectClient(client);
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

    const tokenA = jwt.sign({ userId: userA._id.toString() }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const tokenB = jwt.sign({ userId: userB._id.toString() }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const tokenNonMember = jwt.sign({ userId: nonMember._id.toString() }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const clientAResult = await connectClient(tokenA);
    assert.ok(!clientAResult.error, `User A connection failed: ${clientAResult.error?.message}`);
    const clientA = clientAResult;
    clients.add(clientA);
    const clientBResult = await connectClient(tokenB);
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

    const unauthenticated = await connectClient(null);
    assert.ok(unauthenticated.error, "connection without a JWT must be rejected");
    assert.match(unauthenticated.error.message, /authentication/i);
    unauthenticated.socket.close();

    const nonMemberResult = await connectClient(tokenNonMember);
    assert.ok(!nonMemberResult.error, `Non-member should authenticate: ${nonMemberResult.error?.message}`);
    const nonMemberSocket = nonMemberResult;
    clients.add(nonMemberSocket);
    const nonMemberError = waitForEvent(nonMemberSocket, "socketError", { rejectOnSocketError: false });
    nonMemberSocket.emit("sendMessage", { roomId: room._id.toString(), content: `unauthorized-${suffix}` });
    assert.match((await nonMemberError)[0].message, /not a member/i);
    assert.equal(await Message.countDocuments({ room: room._id, content: `unauthorized-${suffix}` }), 0);
  });
});
