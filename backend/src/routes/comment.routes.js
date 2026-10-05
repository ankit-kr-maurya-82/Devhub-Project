import express from "express";
import {
  addAnswerComment,
  addQuestionComment,
  deleteComment,
  getAnswerComments,
  getQuestionComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/questions/:questionId/comments", authMiddleware, addQuestionComment);
router.get("/questions/:questionId/comments", getQuestionComments);
router.post("/answers/:answerId/comments", authMiddleware, addAnswerComment);
router.get("/answers/:answerId/comments", getAnswerComments);
router.patch("/comments/:commentId", authMiddleware, updateComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

export default router;
