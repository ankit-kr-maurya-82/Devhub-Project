import { logSafeError } from "../utils/logSafeError.js";
import mongoose from "mongoose";
import CodingProblem from "../models/codingProblem.model.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedFields = new Set(["title", "slug", "description", "difficulty", "topics", "constraints", "sampleTestCases", "supportedLanguages", "status"]);
const languages = new Set(["javascript", "python", "java", "cpp"]);
const sendError = (res, status, message) => res.status(status).json({ success: false, message });
const parsePositive = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};
const slugFromTitle = title => title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120).replace(/-+$/g, "");

const validateProblem = (body, creating = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be an object";
  if (Object.keys(body).some(field => !allowedFields.has(field))) return "Unsupported problem field";
  if (creating && ["title", "description", "difficulty"].some(field => typeof body[field] !== "string")) return "Title, description, and difficulty are required";
  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length < 5 || body.title.trim().length > 180)) return "Title must be between 5 and 180 characters";
  if (body.description !== undefined && (typeof body.description !== "string" || body.description.trim().length < 20 || body.description.length > 20000)) return "Description must be between 20 and 20000 characters";
  if (body.difficulty !== undefined && !["easy", "medium", "hard"].includes(body.difficulty)) return "Difficulty must be easy, medium, or hard";
  if (body.slug !== undefined && (typeof body.slug !== "string" || body.slug.length > 120 || !slugPattern.test(body.slug))) return "Slug must contain lowercase letters, numbers, and single hyphens";
  if (body.topics !== undefined && (!Array.isArray(body.topics) || body.topics.length > 15 || body.topics.some(topic => typeof topic !== "string" || !topic.trim() || topic.trim().length > 40))) return "Topics must contain up to 15 non-empty values of at most 40 characters";
  if (body.constraints !== undefined && (!Array.isArray(body.constraints) || body.constraints.length > 30 || body.constraints.some(item => typeof item !== "string" || !item.trim() || item.length > 500))) return "Constraints must contain up to 30 non-empty values of at most 500 characters";
  if (body.sampleTestCases !== undefined && (!Array.isArray(body.sampleTestCases) || body.sampleTestCases.length > 20 || body.sampleTestCases.some(test => !test || typeof test !== "object" || Array.isArray(test) || typeof test.input !== "string" || typeof test.expectedOutput !== "string" || test.input.length > 4000 || test.expectedOutput.length > 4000 || (test.explanation !== undefined && (typeof test.explanation !== "string" || test.explanation.length > 1000)) || Object.keys(test).some(key => !["input", "expectedOutput", "explanation"].includes(key))))) return "Sample test cases are invalid or exceed their limits";
  if (body.supportedLanguages !== undefined && (!Array.isArray(body.supportedLanguages) || body.supportedLanguages.length < 1 || body.supportedLanguages.length > languages.size || body.supportedLanguages.some(language => !languages.has(language)) || new Set(body.supportedLanguages).size !== body.supportedLanguages.length)) return "Select one or more supported languages from the allowed list";
  if (body.status !== undefined && !["draft", "published"].includes(body.status)) return "Status must be draft or published";
  if (creating && body.slug === undefined && !slugFromTitle(body.title)) return "Title cannot be converted into a valid slug";
  return null;
};
const normalizeProblem = body => ({
  ...body,
  ...(body.slug === undefined && body.title !== undefined ? { slug: slugFromTitle(body.title.trim()) } : {}),
  ...(body.topics !== undefined ? { topics: [...new Set(body.topics.map(topic => topic.trim().toLowerCase()))] } : {}),
});
const duplicateSlug = error => error?.code === 11000 && Boolean(error?.keyPattern?.slug || error?.keyValue?.slug);

const listPublishedProblems = async (req, res) => {
  const page = parsePositive(req.query.page, 1);
  const limit = parsePositive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  const filter = { status: "published" };
  if (req.query.difficulty !== undefined) {
    if (!(["easy", "medium", "hard"].includes(req.query.difficulty))) return sendError(res, 400, "Invalid difficulty filter");
    filter.difficulty = req.query.difficulty;
  }
  if (req.query.topic !== undefined) {
    if (typeof req.query.topic !== "string" || !req.query.topic.trim() || req.query.topic.trim().length > 40) return sendError(res, 400, "topic must be a non-empty string of at most 40 characters");
    filter.topics = req.query.topic.trim().toLowerCase();
  }
  try {
    const [problems, total] = await Promise.all([
      CodingProblem.find(filter).select("title slug description difficulty topics supportedLanguages createdAt updatedAt").sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      CodingProblem.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data: problems, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    logSafeError("List Coding Problems Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getPublishedProblem = async (req, res) => {
  if (!slugPattern.test(req.params.slug)) return sendError(res, 400, "Invalid problem slug");
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug, status: "published" });
    if (!problem) return sendError(res, 404, "Problem not found");
    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    logSafeError("Get Coding Problem Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const listAdminProblems = async (req, res) => {
  const page = parsePositive(req.query.page, 1);
  const limit = parsePositive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  try {
    const [problems, total] = await Promise.all([
      CodingProblem.find({}).sort({ updatedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      CodingProblem.countDocuments({}),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({ success: true, data: problems, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
  } catch (error) {
    logSafeError("Admin Coding Problems List Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getAdminProblem = async (req, res) => {
  if (!slugPattern.test(req.params.slug)) return sendError(res, 400, "Invalid problem slug");
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug });
    if (!problem) return sendError(res, 404, "Problem not found");
    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    logSafeError("Admin Coding Problem Get Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const createProblem = async (req, res) => {
  const validationError = validateProblem(req.body, true);
  if (validationError) return sendError(res, 400, validationError);
  try {
    const problem = await CodingProblem.create({ ...normalizeProblem(req.body), status: req.body.status || "draft" });
    return res.status(201).json({ success: true, message: "Problem created successfully", data: problem });
  } catch (error) {
    if (duplicateSlug(error)) return sendError(res, 409, "A problem with this slug already exists");
    if (error instanceof mongoose.Error.ValidationError) return sendError(res, 400, "Problem fields failed validation");
    logSafeError("Create Coding Problem Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const updateProblem = async (req, res) => {
  if (!slugPattern.test(req.params.slug)) return sendError(res, 400, "Invalid problem slug");
  const validationError = validateProblem(req.body);
  if (validationError) return sendError(res, 400, validationError);
  if (!Object.keys(req.body).length) return sendError(res, 400, "Provide at least one field to update");
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug });
    if (!problem) return sendError(res, 404, "Problem not found");
    Object.assign(problem, normalizeProblem(req.body));
    await problem.save();
    return res.status(200).json({ success: true, message: "Problem updated successfully", data: problem });
  } catch (error) {
    if (duplicateSlug(error)) return sendError(res, 409, "A problem with this slug already exists");
    if (error instanceof mongoose.Error.ValidationError) return sendError(res, 400, "Problem fields failed validation");
    logSafeError("Update Coding Problem Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const deleteProblem = async (req, res) => {
  if (!slugPattern.test(req.params.slug)) return sendError(res, 400, "Invalid problem slug");
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug });
    if (!problem) return sendError(res, 404, "Problem not found");
    await problem.deleteOne();
    return res.status(200).json({ success: true, message: "Problem deleted successfully" });
  } catch (error) {
    logSafeError("Delete Coding Problem Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

export { listPublishedProblems, getPublishedProblem, listAdminProblems, getAdminProblem, createProblem, updateProblem, deleteProblem, validateProblem };
