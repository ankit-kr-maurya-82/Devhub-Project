import express from "express";
import { createReport } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/", authMiddleware, createReport);
export default router;
