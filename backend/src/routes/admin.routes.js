import express from "express";
import { getDashboard, listUsers, listUserActivity, listAdminContent, listReports, moderateReport, setUserActiveStatus } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getDashboard);
router.get("/users", listUsers);
router.get("/users/:userId/activity", listUserActivity);
router.get("/content/:type", listAdminContent);
router.patch("/users/:userId/status", setUserActiveStatus);
router.get("/reports", listReports);
router.patch("/reports/:reportId", moderateReport);

export default router;
