import { logSafeError } from "../utils/logSafeError.js";
import mongoose from "mongoose";
import Blog from "../models/blog.model.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedFields = new Set(["title", "slug", "content", "tags", "status"]);
const authorFields = "name username avatar";

const slugFromTitle = (title) => title
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 120)
  .replace(/-+$/g, "");

const validSlug = (slug) => typeof slug === "string" && slug.length <= 120 && slugPattern.test(slug);
const parsePositive = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const validatePayload = (body, { creating = false } = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be an object";
  if (Object.keys(body).some((field) => !allowedFields.has(field))) return "Unsupported blog field";
  if (creating && (typeof body.title !== "string" || typeof body.content !== "string")) return "Title and content are required";
  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length < 5 || body.title.trim().length > 180)) return "Title must be between 5 and 180 characters";
  if (body.content !== undefined && (typeof body.content !== "string" || body.content.trim().length < 20 || body.content.length > 40000)) return "Content must be between 20 and 40000 characters";
  if (body.slug !== undefined && !validSlug(body.slug)) return "Slug must contain lowercase letters, numbers, and single hyphens";
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 10 || body.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.trim().length > 30))) return "Tags must contain up to 10 non-empty values of at most 30 characters";
  if (body.status !== undefined && !["draft", "published"].includes(body.status)) return "Status must be draft or published";
  if (creating && body.slug === undefined && !slugFromTitle(body.title)) return "Title cannot be converted into a valid slug";
  return null;
};

const normalizeTags = (tags = []) => [...new Set(tags.map((tag) => tag.trim().toLowerCase()))];
const duplicateSlug = (error) => error?.code === 11000 && Boolean(error?.keyPattern?.slug || error?.keyValue?.slug);
const sendError = (res, status, message) => res.status(status).json({ success: false, message });

const createBlog = async (req, res) => {
  const validationError = validatePayload(req.body, { creating: true });
  if (validationError) return sendError(res, 400, validationError);

  const { title, content, tags, status = "draft" } = req.body;
  const slug = req.body.slug ?? slugFromTitle(title.trim());
  try {
    const blog = await Blog.create({
      title: title.trim(),
      slug,
      content: content.trim(),
      tags: normalizeTags(tags),
      status,
      publishedAt: status === "published" ? new Date() : null,
      author: req.user._id,
    });
    await blog.populate("author", authorFields);
    return res.status(201).json({ success: true, message: "Blog created successfully", data: blog });
  } catch (error) {
    if (duplicateSlug(error)) return sendError(res, 409, "A blog with this slug already exists");
    logSafeError("Create Blog Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getPublishedBlogs = async (req, res) => {
  const page = parsePositive(req.query.page, 1);
  const limit = parsePositive(req.query.limit, 9);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
    return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  }
  if (req.query.search !== undefined && (typeof req.query.search !== "string" || req.query.search.trim().length > 100)) {
    return sendError(res, 400, "search must be a string of at most 100 characters");
  }
  if (req.query.tag !== undefined && (typeof req.query.tag !== "string" || !req.query.tag.trim() || req.query.tag.trim().length > 30)) {
    return sendError(res, 400, "tag must be a non-empty string of at most 30 characters");
  }

  const filter = { status: "published", moderationStatus: { $ne: "hidden" } };
  const search = req.query.search?.trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ title: { $regex: escaped, $options: "i" } }, { content: { $regex: escaped, $options: "i" } }];
  }
  if (req.query.tag) filter.tags = req.query.tag.trim().toLowerCase();

  try {
    const [blogs, total] = await Promise.all([
      Blog.find(filter).populate("author", authorFields).sort({ publishedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Blog.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    logSafeError("List Blogs Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getMyBlogs = async (req, res) => {
  const page = parsePositive(req.query.page, 1);
  const limit = parsePositive(req.query.limit, 20);
  if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
    return sendError(res, 400, "page and limit must be positive integers; limit must not exceed 50");
  }
  try {
    const filter = { author: req.user._id };
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ updatedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Blog.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: blogs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logSafeError("List Own Blogs Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getPublishedBlog = async (req, res) => {
  if (!validSlug(req.params.slug)) return sendError(res, 400, "Invalid blog slug");
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published", moderationStatus: { $ne: "hidden" } }).populate("author", authorFields);
    if (!blog) return sendError(res, 404, "Blog not found");
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    logSafeError("Get Blog Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getMyBlog = async (req, res) => {
  if (!validSlug(req.params.slug)) return sendError(res, 400, "Invalid blog slug");
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, author: req.user._id }).populate("author", authorFields);
    if (!blog) return sendError(res, 404, "Blog not found");
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    logSafeError("Get Own Blog Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const updateBlog = async (req, res) => {
  if (!validSlug(req.params.slug)) return sendError(res, 400, "Invalid blog slug");
  const validationError = validatePayload(req.body);
  if (validationError) return sendError(res, 400, validationError);
  if (!Object.keys(req.body).length) return sendError(res, 400, "Provide at least one field to update");

  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return sendError(res, 404, "Blog not found");
    if (blog.author.toString() !== req.user._id.toString()) return sendError(res, 403, "You can only update your own blogs");

    const { title, slug, content, tags, status } = req.body;
    if (title !== undefined) blog.title = title.trim();
    if (slug !== undefined) blog.slug = slug;
    if (content !== undefined) blog.content = content.trim();
    if (tags !== undefined) blog.tags = normalizeTags(tags);
    if (status !== undefined) {
      blog.status = status;
      blog.publishedAt = status === "published" ? (blog.publishedAt || new Date()) : null;
    }
    await blog.save();
    await blog.populate("author", authorFields);
    return res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    if (duplicateSlug(error)) return sendError(res, 409, "A blog with this slug already exists");
    if (error instanceof mongoose.Error.ValidationError) return sendError(res, 400, "Blog fields failed validation");
    logSafeError("Update Blog Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

const deleteBlog = async (req, res) => {
  if (!validSlug(req.params.slug)) return sendError(res, 400, "Invalid blog slug");
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return sendError(res, 404, "Blog not found");
    if (blog.author.toString() !== req.user._id.toString()) return sendError(res, 403, "You can only delete your own blogs");
    await blog.deleteOne();
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    logSafeError("Delete Blog Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

export { createBlog, getPublishedBlogs, getMyBlogs, getPublishedBlog, getMyBlog, updateBlog, deleteBlog };
