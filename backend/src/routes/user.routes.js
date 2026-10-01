import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { authMiddleware as isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", isAuthenticated, getProfile);


export default router;
