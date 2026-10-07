import { io } from "socket.io-client";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWMzZWRiNTQ1ZDg3MzYxMDMxMjQ0OTAiLCJ1c2VybmFtZSI6ImRrbSIsImlhdCI6MTc5MTM2NjA5OSwiZXhwIjoxNzkxMzY5Njk5fQ.msFyedCPGftk_giqFaYK-TYy6PijijyplWeRW8uum1A"; // Replace with your actual JWT token
const ROOM_ID = "6ac60014a2bc1bbe19594c55";

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
    content: "Hello from DevHub real-time chat!",
    messageType: "text",
  });
});

socket.on("newMessage", (message) => {
  console.log("New message:", message);
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