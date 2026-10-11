import CodingProblem from "../models/codingProblem.model.js";
import Submission from "../models/submission.model.js";
import judgeService from "../services/judge.service.js";

const languages = new Set(["javascript", "python", "java", "cpp"]);
const sendError = (res, status, message) => res.status(status).json({ success: false, message });
const parsePositive = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const createSubmission = async (req, res) => {
  const { language, sourceCode } = req.body || {};
  if (typeof language !== "string" || !languages.has(language)) return sendError(res, 400, "Select a supported language");
  if (typeof sourceCode !== "string" || !sourceCode.trim() || sourceCode.length > 20000) return sendError(res, 400, "Source code is required and must not exceed 20000 characters");
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug, status: "published" }).select("supportedLanguages");
    if (!problem) return sendError(res, 404, "Problem not found");
    if (!problem.supportedLanguages.includes(language)) return sendError(res, 400, "This language is not enabled for the problem");

    // This service currently reports unavailable and never evaluates source locally.
    const execution = judgeService.unavailableResult();
    const submission = await Submission.create({
      problem: problem._id,
      user: req.user._id,
      language,
      sourceCode,
      verdict: execution.verdict,
      executionMetadata: execution.executionMetadata,
    });
    return res.status(201).json({
      success: true,
      message: "Submission stored; code was not executed because no secure judge service is configured.",
      data: {
        _id: submission._id,
        problem: problem._id,
        language: submission.language,
        verdict: submission.verdict,
        executionMetadata: submission.executionMetadata,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Submission Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const listMySubmissions = async (req, res) => {
  const page = parsePositive(req.query.page, 1);
  const limit = parsePositive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  try {
    const filter = { user: req.user._id };
    const [submissions, total] = await Promise.all([
      Submission.find(filter).select("-sourceCode").populate("problem", "title slug difficulty").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Submission.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data: submissions, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    console.error("List Submissions Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

export { createSubmission, listMySubmissions };
