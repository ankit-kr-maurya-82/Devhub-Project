import express from "express";
import { createQuestion } from "../controllers/question.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createQuestion);

export default router;