import express from "express";
import { rateLimit } from "express-rate-limit";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    registerUser,
    getRegisterPage, 
    getLoginPage, 
    getDashboard, 
    loginUser,
    logoutUser,
    getForgetPasswordPage,
    getResetPasswordPage,
    forgetPassword,
    resetPassword
} from "../controllers/auth.controller.js";

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many authentication attempts. Try again later." } });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many password reset attempts. Try again later." } });

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/register", getRegisterPage);
router.get("/login", getLoginPage);
router.get("/dashboard", authMiddleware, getDashboard);
router.get("/logout", logoutUser);
router.get(["/forgot-password", "/forget-password"], getForgetPasswordPage);
router.post(["/forgot-password", "/forget-password"], resetLimiter, forgetPassword);
router.get("/reset-password/:token", getResetPasswordPage);
router.post("/reset-password/:token", resetLimiter, resetPassword);

export default router;
