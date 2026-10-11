import express from "express";
import {
  createProblem,
  deleteProblem,
  getPublishedProblem,
  getAdminProblem,
  listAdminProblems,
  listPublishedProblems,
  updateProblem,
} from "../controllers/codingProblem.controller.js";
import { createSubmission, listMySubmissions } from "../controllers/submission.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/manage", authMiddleware, adminMiddleware, listAdminProblems);
router.get("/manage/:slug", authMiddleware, adminMiddleware, getAdminProblem);
router.get("/", listPublishedProblems);
router.get("/:slug", getPublishedProblem);
router.post("/:slug/submissions", authMiddleware, createSubmission);
router.post("/", authMiddleware, adminMiddleware, createProblem);
router.patch("/:slug", authMiddleware, adminMiddleware, updateProblem);
router.delete("/:slug", authMiddleware, adminMiddleware, deleteProblem);

export const submissionRouter = express.Router();
submissionRouter.get("/", authMiddleware, listMySubmissions);

export default router;
