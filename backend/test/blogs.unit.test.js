import { afterEach, describe, expect, it, vi } from "vitest";
import Blog from "../src/models/blog.model.js";
import {
  createBlog,
  deleteBlog,
  getMyBlog,
  getMyBlogs,
  getPublishedBlog,
  getPublishedBlogs,
  updateBlog,
} from "../src/controllers/blog.controller.js";

const ownerId = "507f1f77bcf86cd799439011";
const otherId = "507f191e810c19729de860ea";
const content = "A sufficiently long blog post body for unit testing.";
const response = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const request = ({ body = {}, params = {}, query = {}, userId = ownerId } = {}) => ({
  body, params, query, user: { _id: userId },
});
const populated = value => ({ populate: vi.fn().mockResolvedValue(value) });
const queryResult = value => ({
  populate() { return this; },
  sort() { return this; },
  skip() { return this; },
  limit() { return Promise.resolve(value); },
});

afterEach(() => vi.restoreAllMocks());

describe("blog controller unit checks", () => {
  it("creates a draft with a generated slug and authenticated author", async () => {
    const saved = { slug: "hello-devhub", status: "draft" };
    const create = vi.spyOn(Blog, "create").mockResolvedValue({ ...saved, populate: vi.fn().mockResolvedValue(saved) });
    const res = response();
    await createBlog(request({ body: { title: "Hello DevHub", content } }), res);
    expect(res.statusCode).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ slug: "hello-devhub", status: "draft", author: ownerId }));
  });

  it("rejects invalid fields before creating a record", async () => {
    const create = vi.spyOn(Blog, "create");
    const res = response();
    await createBlog(request({ body: { title: "Tiny", content, status: "published", isAdmin: true } }), res);
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("lists published blogs only and escapes a search expression", async () => {
    const find = vi.spyOn(Blog, "find").mockReturnValue(queryResult([]));
    vi.spyOn(Blog, "countDocuments").mockResolvedValue(0);
    const res = response();
    await getPublishedBlogs(request({ query: { search: "a+b", tag: "React", page: "2", limit: "5" } }), res);
    expect(res.statusCode).toBe(200);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({
      status: "published",
      tags: "react",
      $or: expect.arrayContaining([
        expect.objectContaining({ title: { $regex: "a\\+b", $options: "i" } }),
      ]),
    }));
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 5 });
  });

  it("does not return drafts through public detail lookup", async () => {
    const findOne = vi.spyOn(Blog, "findOne").mockReturnValue(populated(null));
    const res = response();
    await getPublishedBlog(request({ params: { slug: "still-draft" } }), res);
    expect(findOne).toHaveBeenCalledWith({ slug: "still-draft", status: "published", moderationStatus: { $ne: "hidden" } });
    expect(res.statusCode).toBe(404);
  });

  it("scopes owner detail and listing queries to the authenticated author", async () => {
    const findOne = vi.spyOn(Blog, "findOne").mockReturnValue(populated({ slug: "mine" }));
    const res = response();
    await getMyBlog(request({ params: { slug: "mine" } }), res);
    expect(findOne).toHaveBeenCalledWith({ slug: "mine", author: ownerId });
    const find = vi.spyOn(Blog, "find").mockReturnValue(queryResult([]));
    vi.spyOn(Blog, "countDocuments").mockResolvedValue(0);
    await getMyBlogs(request(), response());
    expect(find).toHaveBeenCalledWith({ author: ownerId });
  });

  it("rejects updates and deletes by a non-owner", async () => {
    const blog = { author: { toString: () => ownerId }, save: vi.fn(), deleteOne: vi.fn() };
    vi.spyOn(Blog, "findOne").mockResolvedValue(blog);
    const updateResponse = response();
    await updateBlog(request({ params: { slug: "owned" }, body: { title: "Changed title" }, userId: otherId }), updateResponse);
    expect(updateResponse.statusCode).toBe(403);
    expect(blog.save).not.toHaveBeenCalled();
    const deleteResponse = response();
    await deleteBlog(request({ params: { slug: "owned" }, userId: otherId }), deleteResponse);
    expect(deleteResponse.statusCode).toBe(403);
    expect(blog.deleteOne).not.toHaveBeenCalled();
  });

  it("updates an owner's publication state and allows owner deletion", async () => {
    const blog = {
      author: { toString: () => ownerId }, status: "draft", publishedAt: null,
      save: vi.fn().mockResolvedValue(undefined), populate: vi.fn().mockResolvedValue(undefined),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Blog, "findOne").mockResolvedValue(blog);
    const updateResponse = response();
    await updateBlog(request({ params: { slug: "owned" }, body: { status: "published" } }), updateResponse);
    expect(updateResponse.statusCode).toBe(200);
    expect(blog.publishedAt).toBeInstanceOf(Date);
    expect(blog.save).toHaveBeenCalledOnce();
    const deleteResponse = response();
    await deleteBlog(request({ params: { slug: "owned" } }), deleteResponse);
    expect(deleteResponse.statusCode).toBe(200);
    expect(blog.deleteOne).toHaveBeenCalledOnce();
  });
});
