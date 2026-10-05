import express from "express";
import {
  createAnswer,
  getAnswersByQuestion,
  acceptAnswer,
} from "../controllers/answer.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:questionId/answers", authMiddleware, createAnswer);
router.get("/:questionId/answers", getAnswersByQuestion);
router.patch(
  "/:questionId/answers/:answerId/accept",
  authMiddleware,
  acceptAnswer
);

export default router;
