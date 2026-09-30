import express from "express";
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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/register", getRegisterPage);
router.get("/login", getLoginPage);
router.get("/dashboard", getDashboard);
router.get("/logout", logoutUser);
router.get(["/forgot-password", "/forget-password"], getForgetPasswordPage);
router.post(["/forgot-password", "/forget-password"], forgetPassword);
router.get("/reset-password/:token", getResetPasswordPage);
router.post("/reset-password/:token", resetPassword);

export default router;