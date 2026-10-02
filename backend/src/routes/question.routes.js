import express from "express";

import {
  createQuestion,
  getAllQuestions,
} from "../controllers/question.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createQuestion
);

router.get(
  "/",
  getAllQuestions
);

export default router;