import { logSafeError } from "../utils/logSafeError.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";
import Question from "../models/question.model.js";
import Answer from "../models/answer.model.js";
import Comment from "../models/comment.model.js";
import CodingProblem from "../models/codingProblem.model.js";
import Submission from "../models/submission.model.js";
import Report from "../models/report.model.js";
import ModerationAction from "../models/moderationAction.model.js";
import { disconnectUserSockets } from "../socket/notificationDelivery.js";

const targetModels = { blog: Blog, question: Question, answer: Answer, comment: Comment, user: User };
const previewFields = {
  blog: "title slug status moderationStatus author",
  question: "title description moderationStatus author",
  answer: "content moderationStatus author question",
  comment: "content moderationStatus author targetType targetId",
  user: "name username email role isActive createdAt",
};
const sendError = (res, status, message) => res.status(status).json({ success: false, message });
const positive = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
};
const failPending = (res) => sendError(res, 503, "The action is still pending reconciliation. Retry the same request.");
const completeAction = async (action) => {
  if (action.state !== "completed") {
    action.state = "completed";
    await action.save();
  }
};

const getDashboard = async (_req, res) => {
  try {
    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, suspendedUsers, newUsersLast7Days, totalBlogs, totalQuestions, totalAnswers, totalComments, totalCodingProblems, publishedCodingProblems, totalSubmissions, openReports, recentUsers, recentModerationActivity] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: recentCutoff } }),
      Blog.countDocuments({}),
      Question.countDocuments({}),
      Answer.countDocuments({}),
      Comment.countDocuments({}),
      CodingProblem.countDocuments({}),
      CodingProblem.countDocuments({ status: "published" }),
      Submission.countDocuments({}),
      Report.countDocuments({ status: { $in: ["open", "reviewing", "processing"] } }),
      User.find({}).select("name username role isActive createdAt").sort({ createdAt: -1, _id: -1 }).limit(5),
      ModerationAction.find({}).sort({ createdAt: -1 }).limit(10).populate("actor", "name username"),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          newUsersLast7Days,
          totalBlogs,
          totalQuestions,
          totalAnswers,
          totalComments,
          totalCodingProblems,
          publishedCodingProblems,
          totalSubmissions,
          openReports,
        },
        recentUsers,
        recentModerationActivity,
      },
    });
  } catch (error) {
    logSafeError("Admin Dashboard Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const listUsers = async (req, res) => {
  const page = positive(req.query.page, 1);
  const limit = positive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  if (req.query.search !== undefined && (typeof req.query.search !== "string" || req.query.search.trim().length > 100)) return sendError(res, 400, "search must be at most 100 characters");
  const filter = {};
  if (req.query.search?.trim()) {
    const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["name", "username", "email"].map(field => ({ [field]: { $regex: escaped, $options: "i" } }));
  }
  if (req.query.status !== undefined) {
    if (!(["active", "suspended"].includes(req.query.status))) return sendError(res, 400, "status must be active or suspended");
    filter.isActive = req.query.status === "active";
  }
  try {
    const [users, total] = await Promise.all([
      User.find(filter).select("name username email role isActive reputation createdAt").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data: users, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    logSafeError("Admin User List Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const setUserActiveStatus = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) return sendError(res, 400, "Invalid user ID");
  if (!req.body || Object.keys(req.body).length !== 1 || typeof req.body.isActive !== "boolean") return sendError(res, 400, "Only a boolean isActive field is accepted");
  if (String(req.user._id) === String(userId)) return sendError(res, 400, "You cannot change your own account status");
  try {
    const user = await User.findById(userId).select("name username email role isActive");
    if (!user) return sendError(res, 404, "User not found");
    if (!req.body.isActive && user.role === "admin") return sendError(res, 409, "Administrator accounts cannot be suspended through moderation");
    const desired = req.body.isActive;
    const actionName = desired ? "user_reactivated" : "user_suspended";
    if (user.isActive === desired) {
      const pending = await ModerationAction.findOne({ actor: req.user._id, action: actionName, targetType: "user", targetId: user._id, state: "pending" }).sort({ createdAt: -1 });
      if (pending && pending.previousValue !== desired) await completeAction(pending);
      if (!desired) disconnectUserSockets(user._id);
      return res.status(200).json({ success: true, data: user });
    }
    const pending = await ModerationAction.findOne({ actor: req.user._id, action: actionName, targetType: "user", targetId: user._id, state: "pending", previousValue: user.isActive }).sort({ createdAt: -1 });
    const audit = pending || await ModerationAction.create({ actor: req.user._id, action: actionName, targetType: "user", targetId: user._id, state: "pending", previousValue: user.isActive });
    const updatedUser = await User.findOneAndUpdate({ _id: user._id, isActive: user.isActive }, { $set: { isActive: desired } }, { new: true });
    if (!updatedUser) {
      audit.state = "superseded";
      await audit.save();
      return sendError(res, 409, "Account status changed concurrently; refresh and retry");
    }
    user.isActive = updatedUser.isActive;
    await completeAction(audit);
    if (!desired) disconnectUserSockets(user._id);
    return res.status(200).json({ success: true, message: user.isActive ? "User reactivated" : "User suspended", data: user });
  } catch (error) {
    logSafeError("Admin User Status Error:", error);
    return failPending(res);
  }
};

const createReport = async (req, res) => {
  const body = req.body;
  const allowed = new Set(["targetType", "targetId", "reason", "details"]);
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !allowed.has(key))) return sendError(res, 400, "Invalid report payload");
  if (!Object.hasOwn(targetModels, body.targetType) || !mongoose.isValidObjectId(body.targetId)) return sendError(res, 400, "Invalid report target");
  if (typeof body.reason !== "string" || !body.reason.trim() || body.reason.trim().length > 100) return sendError(res, 400, "Reason must be between 1 and 100 characters");
  if (body.details !== undefined && (typeof body.details !== "string" || body.details.length > 2000)) return sendError(res, 400, "Details must not exceed 2000 characters");
  if (body.targetType === "user" && String(body.targetId) === String(req.user._id)) return sendError(res, 400, "You cannot report your own account");
  try {
    const target = await targetModels[body.targetType].findById(body.targetId).select("_id");
    if (!target) return sendError(res, 404, "Report target not found");
    const report = await Report.create({ reporter: req.user._id, targetType: body.targetType, targetId: body.targetId, reason: body.reason.trim(), details: (body.details || "").trim() });
    return res.status(201).json({ success: true, message: "Report submitted", data: { _id: report._id, status: report.status, createdAt: report.createdAt } });
  } catch (error) {
    logSafeError("Create Report Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const listReports = async (req, res) => {
  const page = positive(req.query.page, 1);
  const limit = positive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  const filter = {};
  if (req.query.status !== undefined) {
    if (!(["open", "reviewing", "processing", "resolved", "dismissed"].includes(req.query.status))) return sendError(res, 400, "Invalid report status");
    filter.status = req.query.status;
  }
  if (req.query.targetType !== undefined) {
    if (!Object.hasOwn(targetModels, req.query.targetType)) return sendError(res, 400, "Invalid report target type");
    filter.targetType = req.query.targetType;
  }
  try {
    const [reports, total] = await Promise.all([
      Report.find(filter).populate("reporter", "name username").populate("moderatedBy", "name username").populate("moderationAction", "action state note").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Report.countDocuments(filter),
    ]);
    const data = await Promise.all(reports.map(async report => {
      const target = await targetModels[report.targetType].findById(report.targetId).select(previewFields[report.targetType]);
      return { ...report.toObject(), target };
    }));
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    logSafeError("Admin Reports List Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const moderateReport = async (req, res) => {
  const { reportId } = req.params;
  if (!mongoose.isValidObjectId(reportId)) return sendError(res, 400, "Invalid report ID");
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !["action", "note"].includes(key))) return sendError(res, 400, "Invalid moderation payload");
  if (!(["review", "dismiss", "hide", "restore", "suspend", "reactivate"].includes(body.action))) return sendError(res, 400, "Invalid moderation action");
  if (body.note !== undefined && (typeof body.note !== "string" || body.note.length > 1000)) return sendError(res, 400, "Moderation note must not exceed 1000 characters");
  try {
    const report = await Report.findById(reportId);
    if (!report) return sendError(res, 404, "Report not found");
    const { action } = body;
    if (["suspend", "reactivate"].includes(action) && report.targetType !== "user") return sendError(res, 400, "Action does not match report target type");
    if (["hide", "restore"].includes(action) && report.targetType === "user") return sendError(res, 400, "Action does not match report target type");
    let journal;
    let previousStatus;
    if (report.moderationAction) {
      journal = await ModerationAction.findById(report.moderationAction);
      if (journal?.state === "completed") {
        const requestedAction = action === "review" ? "report_reviewed" : action === "dismiss" ? "report_dismissed" : action === "hide" ? "content_hidden" : action === "restore" ? "content_restored" : action === "suspend" ? "user_suspended" : "user_reactivated";
        if (report.status !== "reviewing" || journal.action === requestedAction) return sendError(res, 409, "This report action has already been completed");
        report.moderationAction = null;
        await report.save();
        journal = null;
      }
      if (journal && (journal.state !== "pending" || journal.action !== (action === "review" ? "report_reviewed" : action === "dismiss" ? "report_dismissed" : action === "hide" ? "content_hidden" : action === "restore" ? "content_restored" : action === "suspend" ? "user_suspended" : "user_reactivated") || journal.note !== (body.note || ""))) return sendError(res, 409, "A different moderation action is already pending for this report");
      if (journal) previousStatus = journal.previousValue;
    }
    let actionTarget;
    if (["hide", "restore", "suspend", "reactivate"].includes(action)) {
      actionTarget = await targetModels[report.targetType].findById(report.targetId);
      if (!actionTarget) return sendError(res, 404, "Reported target not found");
      if (report.targetType === "user") {
        if (String(actionTarget._id) === String(req.user._id)) return sendError(res, 400, "You cannot change your own account status");
        if (action === "suspend" && actionTarget.role === "admin") return sendError(res, 409, "Administrator accounts cannot be suspended through moderation");
      }
    }
    if (!journal) {
      if (["resolved", "dismissed", "processing"].includes(report.status)) return sendError(res, 409, "This report is already closed or being moderated");
      previousStatus = report.status;
      const auditAction = action === "review" ? "report_reviewed" : action === "dismiss" ? "report_dismissed" : action === "hide" ? "content_hidden" : action === "restore" ? "content_restored" : action === "suspend" ? "user_suspended" : "user_reactivated";
      journal = await ModerationAction.create({ actor: req.user._id, action: auditAction, targetType: report.targetType, targetId: report.targetId, report: report._id, note: body.note || "", state: "pending", previousValue: previousStatus });
      const claimed = await Report.findOneAndUpdate({ _id: report._id, status: previousStatus, moderationAction: null }, { $set: { status: "processing", moderationAction: journal._id } }, { new: true });
      if (!claimed) {
        journal.state = "superseded";
        await journal.save();
        return sendError(res, 409, "Another moderator has already started this report");
      }
      report.status = "processing";
      report.moderationAction = journal._id;
    }
    if (["hide", "restore", "suspend", "reactivate"].includes(action)) {
      if (report.targetType === "user") {
        actionTarget.isActive = action === "reactivate";
      } else {
        actionTarget.moderationStatus = action === "hide" ? "hidden" : "visible";
      }
      await actionTarget.save();
    }
    report.status = action === "review" ? "reviewing" : action === "dismiss" ? "dismissed" : "resolved";
    report.outcome = action === "review" ? report.outcome : body.note?.trim() || action;
    report.moderatedBy = journal.actor;
    report.moderatedAt = new Date();
    await report.save();
    await completeAction(journal);
    if (report.targetType === "user" && action === "suspend") disconnectUserSockets(actionTarget._id);
    return res.status(200).json({ success: true, message: "Moderation action recorded", data: report });
  } catch (error) {
    logSafeError("Moderate Report Error:", error);
    return failPending(res);
  }
};

export { getDashboard, listUsers, setUserActiveStatus, createReport, listReports, moderateReport };
