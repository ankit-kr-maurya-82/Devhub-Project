import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

const emitSocketError = (socket, message) => socket.emit("socketError", { success: false, message });
const validPayloadRoomId = (payload) => payload && typeof payload === "object" && typeof payload.roomId === "string" && mongoose.isValidObjectId(payload.roomId);
const isMember = (room, userId) => room?.members.some((member) => member.equals(userId));

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN?.split(",") ?? true, credentials: true } });

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
      const message = await Message.create({ room: result.room._id, sender: socket.user._id, content, messageType });
      await message.populate("sender", "name username avatar");
      io.to(result.room._id.toString()).emit("newMessage", message);
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
      const sockets = await io.in(roomId).fetchSockets();
      const users = new Map();
      for (const activeSocket of sockets) {
        const user = activeSocket.data?.user;
        if (user) users.set(user._id.toString(), { _id: user._id, name: user.name, username: user.username, avatar: user.avatar });
      }
      socket.emit("roomUsers", { roomId, users: [...users.values()] });
    }));

    socket.on("disconnecting", () => {
      const user = { _id: socket.user._id, name: socket.user.name, username: socket.user.username, avatar: socket.user.avatar };
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) socket.to(roomId).emit("userLeftRoom", { roomId, userId: socket.user._id, user });
      }
    });
  });

  return io;
};

export default initializeSocket;
