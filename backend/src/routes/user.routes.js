import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { authMiddleware as isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile/:userId", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, updateProfile);


export default router;
