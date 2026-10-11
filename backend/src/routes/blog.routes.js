import express from "express";
import {
  createBlog,
  deleteBlog,
  getMyBlog,
  getMyBlogs,
  getPublishedBlog,
  getPublishedBlogs,
  updateBlog,
} from "../controllers/blog.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/mine", authMiddleware, getMyBlogs);
router.get("/mine/:slug", authMiddleware, getMyBlog);
router.get("/", getPublishedBlogs);
router.post("/", authMiddleware, createBlog);
router.get("/:slug", getPublishedBlog);
router.patch("/:slug", authMiddleware, updateBlog);
router.delete("/:slug", authMiddleware, deleteBlog);

export default router;
