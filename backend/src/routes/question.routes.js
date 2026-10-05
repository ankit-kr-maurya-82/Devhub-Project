import express from "express";

import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from "../controllers/question.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createQuestion
);

router.get("/",getAllQuestions);
router.get("/:questionId", getQuestionById);
router.patch("/:questionId",authMiddleware,updateQuestion);

router.delete(
  "/:questionId",
  authMiddleware,
  deleteQuestion
);

export default router;
