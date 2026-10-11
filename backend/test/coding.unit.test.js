import { afterEach, describe, expect, it, vi } from "vitest";
import CodingProblem from "../src/models/codingProblem.model.js";
import Submission from "../src/models/submission.model.js";
import { createProblem, getPublishedProblem, listPublishedProblems, validateProblem } from "../src/controllers/codingProblem.controller.js";
import { createSubmission, listMySubmissions } from "../src/controllers/submission.controller.js";
import { adminMiddleware } from "../src/middlewares/admin.middleware.js";
import judgeService from "../src/services/judge.service.js";

const userId = "507f1f77bcf86cd799439011";
const adminId = "507f191e810c19729de860ea";
const description = "A coding problem description long enough to satisfy validation.";
const res = () => ({ statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const req = ({ body = {}, params = {}, query = {}, id = userId, role = "user" } = {}) => ({ body, params, query, user: { _id: id, role } });
const listQuery = result => ({ select: vi.fn(function select() { return this; }), populate() { return this; }, sort() { return this; }, skip() { return this; }, limit() { return Promise.resolve(result); } });

afterEach(() => vi.restoreAllMocks());

describe("coding module unit checks", () => {
  it("validates required problem fields, difficulty, and sample cases", () => {
    expect(validateProblem({ title: "Tiny", description, difficulty: "easy" }, true)).toMatch(/Title/);
    expect(validateProblem({ title: "Valid title", description, difficulty: "impossible" }, true)).toMatch(/Difficulty/);
    expect(validateProblem({ title: "Valid title", description, difficulty: "easy", sampleTestCases: [{ input: "x" }] }, true)).toMatch(/Sample test cases/);
    expect(validateProblem({ title: "Valid title", description, difficulty: "easy", supportedLanguages: ["shell"] }, true)).toMatch(/supported languages/);
  });

  it("requires the existing admin role for problem management", () => {
    const denied = res();
    const next = vi.fn();
    adminMiddleware(req(), denied, next);
    expect(denied.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
    const allowed = res();
    adminMiddleware(req({ role: "admin" }), allowed, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid problem payloads before persistence", async () => {
    const create = vi.spyOn(CodingProblem, "create");
    const response = res();
    await createProblem(req({ body: { title: "Tiny", description, difficulty: "easy" } }), response);
    expect(response.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("lists published problems with difficulty, topic, and pagination filters", async () => {
    const find = vi.spyOn(CodingProblem, "find").mockReturnValue(listQuery([]));
    vi.spyOn(CodingProblem, "countDocuments").mockResolvedValue(0);
    const response = res();
    await listPublishedProblems(req({ query: { difficulty: "medium", topic: "Arrays", page: "2", limit: "5" } }), response);
    expect(response.statusCode).toBe(200);
    expect(find).toHaveBeenCalledWith({ status: "published", difficulty: "medium", topics: "arrays" });
    expect(response.body.pagination).toMatchObject({ page: 2, limit: 5 });
  });

  it("hides unpublished problem details from public lookup", async () => {
    const findOne = vi.spyOn(CodingProblem, "findOne").mockResolvedValue(null);
    const response = res();
    await getPublishedProblem(req({ params: { slug: "draft-problem" } }), response);
    expect(findOne).toHaveBeenCalledWith({ slug: "draft-problem", status: "published" });
    expect(response.statusCode).toBe(404);
  });

  it("stores a submission under the authenticated user without executing it", async () => {
    vi.spyOn(CodingProblem, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: "problem-id", supportedLanguages: ["javascript"] }) });
    const create = vi.spyOn(Submission, "create").mockImplementation(async data => ({ _id: "submission-id", ...data, createdAt: new Date("2026-01-01T00:00:00Z") }));
    const judge = vi.spyOn(judgeService, "unavailableResult");
    const response = res();
    await createSubmission(req({ params: { slug: "sum-two" }, body: { language: "javascript", sourceCode: "return 2;", user: adminId } }), response);
    expect(response.statusCode).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ problem: "problem-id", user: userId, verdict: "unavailable", executionMetadata: expect.objectContaining({ executed: false }) }));
    expect(judge).toHaveBeenCalledOnce();
    expect(response.body.data).not.toHaveProperty("sourceCode");
  });

  it("scopes submission history to the authenticated user and excludes source code", async () => {
    const find = vi.spyOn(Submission, "find").mockReturnValue(listQuery([]));
    vi.spyOn(Submission, "countDocuments").mockResolvedValue(0);
    const response = res();
    await listMySubmissions(req(), response);
    expect(find).toHaveBeenCalledWith({ user: userId });
    expect(find.mock.results[0].value.select).toHaveBeenCalledWith("-sourceCode");
    expect(response.statusCode).toBe(200);
  });
});
