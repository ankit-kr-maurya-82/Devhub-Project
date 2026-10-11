import express from "express";
import { getDashboard, listUsers, listReports, moderateReport, setUserActiveStatus } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getDashboard);
router.get("/users", listUsers);
router.patch("/users/:userId/status", setUserActiveStatus);
router.get("/reports", listReports);
router.patch("/reports/:reportId", moderateReport);

export default router;
