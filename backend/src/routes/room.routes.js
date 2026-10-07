import express from "express";
import { createRoom, getRooms, getRoomById, joinRoom, leaveRoom } from "../controllers/room.controller.js";
import { getRoomMessages } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", getRooms);
router.post("/", authMiddleware, createRoom);
router.get("/:roomId", getRoomById);
router.post("/:roomId/join", authMiddleware, joinRoom);
router.post("/:roomId/leave", authMiddleware, leaveRoom);
router.get("/:roomId/messages", getRoomMessages);

export default router;
