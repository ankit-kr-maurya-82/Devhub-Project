import express from "express";
import { getMyPresence, getUserPresence } from "../controllers/presence.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me/presence", authMiddleware, getMyPresence);
router.get("/:userId/presence", authMiddleware, getUserPresence);

export default router;
