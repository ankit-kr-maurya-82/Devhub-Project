import express from "express";
import {
  createAnswer,
  getAnswersByQuestion,
  acceptAnswer,
} from "../controllers/answer.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { voteAnswer } from "../controllers/vote.controller.js";

const router = express.Router();
const answerVoteRouter = express.Router();

router.post("/:questionId/answers", authMiddleware, createAnswer);
router.get("/:questionId/answers", getAnswersByQuestion);
router.patch(
  "/:questionId/answers/:answerId/accept",
  authMiddleware,
  acceptAnswer
);

answerVoteRouter.post("/:answerId/vote", authMiddleware, voteAnswer);

export default router;
export { answerVoteRouter };
