import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";
import { addUserSocket, removeUserSocket, isUserOnline } from "./presence.js";

const emitSocketError = (socket, message) => socket.emit("socketError", { success: false, message });
const validPayloadRoomId = (payload) => payload && typeof payload === "object" && typeof payload.roomId === "string" && mongoose.isValidObjectId(payload.roomId);
const isMember = (room, userId) => room?.members.some((member) => member.equals(userId));
const replyPopulate = { path: "replyTo", select: "_id content sender isDeleted", populate: { path: "sender", select: "name username avatar" } };

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN?.split(",") ?? true, credentials: true } });
  const presenceUpdates = new Map();

  const savePresence = (userId, online) => {
    const previous = presenceUpdates.get(userId) ?? Promise.resolve();
    const update = previous.catch(() => {}).then(async () => {
      // Recheck when this queued update runs so fast reconnects cannot be overwritten by stale disconnects.
      if (isUserOnline(userId) !== online) return;
      const user = await User.findById(userId).select("username isOnline lastSeen");
      if (!user) return;
      if (isUserOnline(userId) !== online) return;
      user.isOnline = online;
      if (!online) user.lastSeen = new Date();
      await user.save();
      if (isUserOnline(userId) !== online) return;
      if (online) {
        io.emit("userOnline", { userId, username: user.username, isOnline: true });
      } else {
        io.emit("userOffline", { userId, username: user.username, isOnline: false, lastSeen: user.lastSeen });
      }
    }).catch((error) => console.error("Socket presence update error:", error));
    presenceUpdates.set(userId, update);
    void update.finally(() => {
      if (presenceUpdates.get(userId) === update) presenceUpdates.delete(userId);
    });
  };

  const getRoomUsers = async (roomId) => {
    const sockets = await io.in(roomId).fetchSockets();
    const users = new Map();
    for (const activeSocket of sockets) {
      const user = activeSocket.data?.user;
      if (user) {
        const userId = user._id.toString();
        users.set(userId, { userId, _id: userId, username: user.username, name: user.name, avatar: user.avatar });
      }
    }
    return [...users.values()];
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || !token || !process.env.JWT_SECRET) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decoded.userId !== "string" || !mongoose.isValidObjectId(decoded.userId)) return next(new Error("Invalid authentication token"));
      const user = await User.findById(decoded.userId).select("name username avatar isActive");
      if (!user || !user.isActive) return next(new Error("Authentication required"));
      socket.user = user;
      socket.data.user = { _id: user._id, name: user.name, username: user.username, avatar: user.avatar };
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    if (addUserSocket(userId, socket.id)) savePresence(userId, true);

    const verifyRoomMembership = async (payload) => {
      if (!validPayloadRoomId(payload)) return { error: "A valid roomId is required" };
      const room = await Room.findById(payload.roomId).select("members");
      if (!room) return { error: "Room not found" };
      if (!isMember(room, socket.user._id)) return { error: "You are not a member of this room" };
      return { room };
    };
    const guard = (handler) => async (payload) => {
      try { await handler(payload); }
      catch (error) { console.error("Socket event error:", error); emitSocketError(socket, "Unable to complete socket event"); }
    };

    socket.on("joinRoom", guard(async (payload) => {
      const result = await verifyRoomMembership(payload);
      if (result.error) return emitSocketError(socket, result.error);
      const roomId = result.room._id.toString();
      const alreadyJoined = socket.rooms.has(roomId);
      await socket.join(roomId);
      socket.emit("roomJoined", { roomId });
      if (!alreadyJoined) socket.to(roomId).emit("userJoinedRoom", { roomId, user: { _id: socket.user._id, name: socket.user.name, username: socket.user.username, avatar: socket.user.avatar } });
      socket.emit("roomUsers", { roomId, users: await getRoomUsers(roomId) });
    }));

    socket.on("leaveRoom", guard(async (payload) => {
      const result = await verifyRoomMembership(payload);
      if (result.error) return emitSocketError(socket, result.error);
      const roomId = result.room._id.toString();
      if (!socket.rooms.has(roomId)) return emitSocketError(socket, "You have not joined this room");
      await socket.leave(roomId);
      socket.to(roomId).emit("userLeftRoom", { roomId, userId: socket.user._id });
    }));

    socket.on("sendMessage", guard(async (payload) => {
      const result = await verifyRoomMembership(payload);
      if (result.error) return emitSocketError(socket, result.error);
      if (!socket.rooms.has(result.room._id.toString())) return emitSocketError(socket, "Join the room before sending messages");
      if (!payload || typeof payload.content !== "string") return emitSocketError(socket, "Message content is required");
      const content = payload.content.trim();
      if (!content || content.length > 2000) return emitSocketError(socket, "Message content must be between 1 and 2000 characters");
      const messageType = payload.messageType ?? "text";
      if (!["text", "image", "file"].includes(messageType)) return emitSocketError(socket, "Invalid message type");
      let replyTo = null;
      if (payload.replyTo !== undefined && payload.replyTo !== null) {
        if (typeof payload.replyTo !== "string" || !mongoose.isValidObjectId(payload.replyTo)) return emitSocketError(socket, "Invalid replyTo message ID");
        const parent = await Message.findById(payload.replyTo).select("_id room");
        if (!parent) return emitSocketError(socket, "Reply target message not found");
        if (!parent.room.equals(result.room._id)) return emitSocketError(socket, "Reply target must belong to the same room");
        replyTo = parent._id;
      }
      const message = await Message.create({ room: result.room._id, sender: socket.user._id, content, messageType, replyTo });
      await message.populate([{ path: "sender", select: "name username avatar" }, replyPopulate]);
      if (message.replyTo?.isDeleted) message.replyTo.content = "This message was deleted";
      io.to(result.room._id.toString()).emit("newMessage", message);
    }));

    socket.on("editMessage", guard(async (payload) => {
      if (!payload || typeof payload.messageId !== "string" || !mongoose.isValidObjectId(payload.messageId)) return emitSocketError(socket, "A valid messageId is required");
      if (typeof payload.content !== "string") return emitSocketError(socket, "Message content is required");
      const content = payload.content.trim();
      if (!content || content.length > 2000) return emitSocketError(socket, "Message content must be between 1 and 2000 characters");
      const message = await Message.findById(payload.messageId);
      if (!message) return emitSocketError(socket, "Message not found");
      if (!message.sender.equals(socket.user._id)) return emitSocketError(socket, "You can only edit your own messages");
      if (message.isDeleted) return emitSocketError(socket, "Deleted messages cannot be edited");
      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();
      await message.populate("sender", "name username avatar");
      io.to(message.room.toString()).emit("messageUpdated", message);
    }));

    socket.on("deleteMessage", guard(async (payload) => {
      if (!payload || typeof payload.messageId !== "string" || !mongoose.isValidObjectId(payload.messageId)) return emitSocketError(socket, "A valid messageId is required");
      const message = await Message.findById(payload.messageId);
      if (!message) return emitSocketError(socket, "Message not found");
      const room = await Room.findById(message.room).select("owner");
      if (!room) return emitSocketError(socket, "Room not found");
      if (!message.sender.equals(socket.user._id) && !room.owner.equals(socket.user._id)) return emitSocketError(socket, "You are not allowed to delete this message");
      if (!message.isDeleted) {
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = "This message was deleted";
        await message.save();
      }
      io.to(message.room.toString()).emit("messageDeleted", { messageId: message._id.toString(), roomId: message.room.toString() });
    }));

    socket.on("reactToMessage", guard(async (payload) => {
      if (!payload || typeof payload.messageId !== "string" || !mongoose.isValidObjectId(payload.messageId)) return emitSocketError(socket, "A valid messageId is required");
      if (typeof payload.emoji !== "string") return emitSocketError(socket, "Emoji is required");
      const emoji = payload.emoji.trim();
      if (!emoji || emoji.length > 10) return emitSocketError(socket, "Emoji must be between 1 and 10 characters");

      const message = await Message.findById(payload.messageId);
      if (!message) return emitSocketError(socket, "Message not found");
      const room = await Room.findById(message.room).select("members");
      if (!room) return emitSocketError(socket, "Room not found");
      if (!isMember(room, socket.user._id)) return emitSocketError(socket, "You are not a member of this room");
      if (message.isDeleted) return emitSocketError(socket, "Cannot react to a deleted message");

      const existingIndex = message.reactions.findIndex((reaction) => reaction.user.equals(socket.user._id) && reaction.emoji === emoji);
      if (existingIndex >= 0) message.reactions.splice(existingIndex, 1);
      else message.reactions.push({ user: socket.user._id, emoji });
      await message.save();
      io.to(message.room.toString()).emit("messageReactionUpdated", {
        messageId: message._id.toString(),
        roomId: message.room.toString(),
        reactions: message.reactions,
      });
    }));

    const typingEvent = (outgoing) => guard(async (payload) => {
      const result = await verifyRoomMembership(payload);
      if (result.error) return emitSocketError(socket, result.error);
      const roomId = result.room._id.toString();
      if (!socket.rooms.has(roomId)) return emitSocketError(socket, "Join the room first");
      socket.to(roomId).emit(outgoing, { roomId, user: { _id: socket.user._id, name: socket.user.name, username: socket.user.username } });
    });
    socket.on("typing", typingEvent("userTyping"));
    socket.on("stopTyping", typingEvent("userStoppedTyping"));

    socket.on("getRoomUsers", guard(async (payload) => {
      const result = await verifyRoomMembership(payload);
      if (result.error) return emitSocketError(socket, result.error);
      const roomId = result.room._id.toString();
      if (!socket.rooms.has(roomId)) return emitSocketError(socket, "Join the room first");
      socket.emit("roomUsers", { roomId, users: await getRoomUsers(roomId) });
    }));

    socket.on("disconnecting", () => {
      const user = { _id: socket.user._id, name: socket.user.name, username: socket.user.username, avatar: socket.user.avatar };
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) socket.to(roomId).emit("userLeftRoom", { roomId, userId: socket.user._id, user });
      }
    });

    socket.on("disconnect", () => {
      if (removeUserSocket(userId, socket.id)) savePresence(userId, false);
    });
  });

  return io;
};

export default initializeSocket;
