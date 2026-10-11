import mongoose from "mongoose";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";
import Question from "../models/question.model.js";
import Answer from "../models/answer.model.js";
import Comment from "../models/comment.model.js";
import Report from "../models/report.model.js";
import ModerationAction from "../models/moderationAction.model.js";

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

const getDashboard = async (_req, res) => {
  try {
    const [totalUsers, activeUsers, suspendedUsers, totalBlogs, totalQuestions, totalAnswers, totalComments, openReports, recentModerationActivity] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Blog.countDocuments({}),
      Question.countDocuments({}),
      Answer.countDocuments({}),
      Comment.countDocuments({}),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      ModerationAction.find({}).sort({ createdAt: -1 }).limit(10).populate("actor", "name username"),
    ]);
    return res.status(200).json({ success: true, data: { counts: { totalUsers, activeUsers, suspendedUsers, totalBlogs, totalQuestions, totalAnswers, totalComments, openReports }, recentModerationActivity } });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
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
    console.error("Admin User List Error:", error);
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
    if (!req.body.isActive && user.isActive && user.role === "admin") {
      const activeAdmins = await User.countDocuments({ role: "admin", isActive: true });
      if (activeAdmins <= 1) return sendError(res, 409, "The last active administrator cannot be suspended");
    }
    if (user.isActive === req.body.isActive) return res.status(200).json({ success: true, data: user });
    user.isActive = req.body.isActive;
    await user.save();
    await ModerationAction.create({ actor: req.user._id, action: user.isActive ? "user_reactivated" : "user_suspended", targetType: "user", targetId: user._id });
    return res.status(200).json({ success: true, message: user.isActive ? "User reactivated" : "User suspended", data: user });
  } catch (error) {
    console.error("Admin User Status Error:", error);
    return sendError(res, 500, "Internal server error");
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
    console.error("Create Report Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const listReports = async (req, res) => {
  const page = positive(req.query.page, 1);
  const limit = positive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  const filter = {};
  if (req.query.status !== undefined) {
    if (!(["open", "reviewing", "resolved", "dismissed"].includes(req.query.status))) return sendError(res, 400, "Invalid report status");
    filter.status = req.query.status;
  }
  if (req.query.targetType !== undefined) {
    if (!Object.hasOwn(targetModels, req.query.targetType)) return sendError(res, 400, "Invalid report target type");
    filter.targetType = req.query.targetType;
  }
  try {
    const [reports, total] = await Promise.all([
      Report.find(filter).populate("reporter", "name username").populate("moderatedBy", "name username").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Report.countDocuments(filter),
    ]);
    const data = await Promise.all(reports.map(async report => {
      const target = await targetModels[report.targetType].findById(report.targetId).select(previewFields[report.targetType]);
      return { ...report.toObject(), target };
    }));
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    console.error("Admin Reports List Error:", error);
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
    if (["resolved", "dismissed"].includes(report.status)) return sendError(res, 409, "This report has already been closed");
    const { action } = body;
    const targetModel = targetModels[report.targetType];
    if (["hide", "restore", "suspend", "reactivate"].includes(action)) {
      if (["suspend", "reactivate"].includes(action) && report.targetType !== "user") return sendError(res, 400, "Action does not match report target type");
      if (["hide", "restore"].includes(action) && report.targetType === "user") return sendError(res, 400, "Action does not match report target type");
      const target = await targetModel.findById(report.targetId);
      if (!target) return sendError(res, 404, "Reported target not found");
      if (report.targetType === "user") {
        if (String(target._id) === String(req.user._id)) return sendError(res, 400, "You cannot change your own account status");
        if (action === "suspend" && target.role === "admin" && target.isActive && await User.countDocuments({ role: "admin", isActive: true }) <= 1) return sendError(res, 409, "The last active administrator cannot be suspended");
        target.isActive = action === "reactivate";
      } else {
        target.moderationStatus = action === "hide" ? "hidden" : "visible";
      }
      await target.save();
    } else if (action === "review") {
      report.status = "reviewing";
      report.moderatedBy = req.user._id;
      report.moderatedAt = new Date();
      await report.save();
      await ModerationAction.create({ actor: req.user._id, action: "report_reviewed", targetType: report.targetType, targetId: report.targetId, report: report._id, note: body.note || "" });
      return res.status(200).json({ success: true, data: report });
    }
    report.status = action === "dismiss" ? "dismissed" : "resolved";
    report.outcome = body.note?.trim() || action;
    report.moderatedBy = req.user._id;
    report.moderatedAt = new Date();
    await report.save();
    const auditAction = action === "dismiss" ? "report_dismissed" : action === "hide" ? "content_hidden" : action === "restore" ? "content_restored" : action === "suspend" ? "user_suspended" : action === "reactivate" ? "user_reactivated" : "report_reviewed";
    await ModerationAction.create({ actor: req.user._id, action: auditAction, targetType: report.targetType, targetId: report.targetId, report: report._id, note: body.note || "" });
    return res.status(200).json({ success: true, message: "Moderation action recorded", data: report });
  } catch (error) {
    console.error("Moderate Report Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

export { getDashboard, listUsers, setUserActiveStatus, createReport, listReports, moderateReport };
