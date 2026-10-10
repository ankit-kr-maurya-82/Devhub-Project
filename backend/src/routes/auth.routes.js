import express from "express";
import { rateLimit } from "express-rate-limit";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    registerUser,
    getDashboard, 
    loginUser,
    logoutUser,
    forgetPassword,
    resetPassword,
    getCurrentUser,
} from "../controllers/auth.controller.js";

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many authentication attempts. Try again later." } });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many password reset attempts. Try again later." } });

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/dashboard", authMiddleware, getDashboard);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/logout", logoutUser);
router.post(["/forgot-password", "/forget-password"], resetLimiter, forgetPassword);
router.post("/reset-password/:token", resetLimiter, resetPassword);

export default router;
