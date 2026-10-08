import { io } from "socket.io-client";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzZWRiNTQ1ZDg3MzYxMDMxMjQ0OTAiLCJ1c2VybmFtZSI6ImRrbSIsImlhdCI6MTc5MTM2NjA5OSwiZXhwIjoxNzkxMzY5Njk5fQ.msFyedCPGftk_giqFaYK-TYy6PijijyplWeRW8uum1A"; // Replace with your actual JWT token
const ROOM_ID = "6ac60014a2bc1bbe19594c55";
const MESSAGE_ID = "REPLACE_WITH_MESSAGE_ID";

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
    content: "This is a reply",
    messageType: "text",
    replyTo: MESSAGE_ID,
  });
});

socket.on("newMessage", (message) => {
  console.log("New message:", message);
  if (!message.replyTo) console.error("Expected replyTo information in newMessage");
  else console.log("Reply target returned:", message.replyTo);
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
