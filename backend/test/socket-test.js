import "dotenv/config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { io } from "socket.io-client";
import Room from "../src/models/room.model.js";
import "../src/models/user.model.js";
import connectDB from "../src/db/index.js";

const ROOM_ID = process.env.SOCKET_TEST_ROOM_ID || "6ac9cf7446950272e627e4df"; // Replace with a valid room ID from your database

const getSocketToken = async () => {
  if (process.env.JWT_TOKEN) return process.env.JWT_TOKEN;
  if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
    throw new Error("Set JWT_TOKEN, or configure JWT_SECRET and MONGODB_URI in .env.");
  }

  await connectDB();
  try {
    const room = await Room.findById(ROOM_ID).populate("members", "isActive");
    const member = room?.members.find((candidate) => candidate.isActive);
    if (!member) throw new Error(`No active member found for room ${ROOM_ID}. Set SOCKET_TEST_ROOM_ID to a room with an active member.`);
    return jwt.sign({ userId: member._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
  } finally {
    await mongoose.disconnect();
  }
};

const TOKEN = await getSocketToken();

const socket = io("http://localhost:4000", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("joinRoom", {
    roomId: ROOM_ID,
  });
});

socket.on("roomJoined", (data) => {
  console.log("Room joined:", data);

  socket.emit("sendMessage", {
    roomId: ROOM_ID,
    content: "This is a normal chat message",
    messageType: "text",
  });
});

socket.on("newMessage", (message) => {
  console.log("New message:", message);
  socket.emit("reactToMessage", {
    messageId: message._id,
    emoji: "👍",
  });
});

socket.on("messageReactionUpdated", (data) => {
  console.log("Message reaction updated:", data);
});

socket.on("userJoinedRoom", (data) => {
  console.log("User joined:", data);
});

socket.on("userLeftRoom", (data) => {
  console.log("User left:", data);
});

socket.on("userTyping", (data) => {
  console.log("User typing:", data);
});

socket.on("userStoppedTyping", (data) => {
  console.log("User stopped typing:", data);
});

socket.on("roomUsers", (data) => {
  console.log("Room users:", data);
});

socket.on("socketError", (error) => {
  console.error("Socket error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

setTimeout(() => {
  socket.emit("typing", {
    roomId: ROOM_ID,
  });

  setTimeout(() => {
    socket.emit("stopTyping", {
      roomId: ROOM_ID,
    });
  }, 2000);
}, 3000);

console.log("Socket test started...");
