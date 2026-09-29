import express from "express";
import {registerUser,getRegisterPage} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/register", getRegisterPage);

export default router;