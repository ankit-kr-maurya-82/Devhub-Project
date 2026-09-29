import express from "express";
import {registerUser,getRegisterPage, getLoginPage, getDashboard} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/register", getRegisterPage);
router.get("/login", getLoginPage);
router.get("/dashboard", getDashboard);

export default router;