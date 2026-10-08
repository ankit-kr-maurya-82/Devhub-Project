import express from "express";
import { deleteMessage, editMessage, toggleMessageReaction } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/:messageId", authMiddleware, editMessage);
router.delete("/:messageId", authMiddleware, deleteMessage);
router.post("/:messageId/reaction", authMiddleware, toggleMessageReaction);

export default router;
