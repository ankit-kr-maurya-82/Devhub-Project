import express from "express";
import {
  createAnswer,
  getAnswersByQuestion,
} from "../controllers/answer.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:questionId/answers", authMiddleware, createAnswer);
router.get("/:questionId/answers", getAnswersByQuestion);

export default router;
