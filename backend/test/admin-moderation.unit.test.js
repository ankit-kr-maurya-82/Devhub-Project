import { afterEach, describe, expect, it, vi } from "vitest";
import User from "../src/models/user.model.js";
import Blog from "../src/models/blog.model.js";
import Comment from "../src/models/comment.model.js";
import Report from "../src/models/report.model.js";
import ModerationAction from "../src/models/moderationAction.model.js";
import { listUsers, setUserActiveStatus, createReport, listReports, moderateReport } from "../src/controllers/admin.controller.js";
import { adminMiddleware } from "../src/middlewares/admin.middleware.js";

const actorId = "507f1f77bcf86cd799439011";
const targetId = "507f191e810c19729de860ea";
const reportId = "507f1f77bcf86cd799439012";
const response = () => ({ statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const request = ({ body = {}, params = {}, query = {}, id = actorId, role = "admin" } = {}) => ({ body, params, query, user: { _id: id, role } });
const queryChain = result => {
  const query = { select: vi.fn(() => query), populate: vi.fn(() => query), sort: vi.fn(() => query), skip: vi.fn(() => query), limit: vi.fn(() => Promise.resolve(result)) };
  return query;
};

afterEach(() => vi.restoreAllMocks());

describe("admin moderation unit checks", () => {
  it("denies non-admins at the backend authorization middleware", () => {
    const res = response(); const next = vi.fn();
    adminMiddleware(request({ role: "user" }), res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("paginates sanitized user results and supports escaped search", async () => {
    const query = queryChain([]);
    const find = vi.spyOn(User, "find").mockReturnValue(query);
    vi.spyOn(User, "countDocuments").mockResolvedValue(0);
    const res = response();
    await listUsers(request({ query: { page: "2", limit: "5", search: "a+b", status: "active" } }), res);
    expect(find).toHaveBeenCalledWith({ isActive: true, $or: expect.arrayContaining([{ email: { $regex: "a\\+b", $options: "i" } }]) });
    expect(query.select).toHaveBeenCalledWith("name username email role isActive reputation createdAt");
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 5 });
  });

  it("prevents an admin from suspending their own account", async () => {
    const find = vi.spyOn(User, "findById");
    const res = response();
    await setUserActiveStatus(request({ params: { userId: actorId }, body: { isActive: false } }), res);
    expect(res.statusCode).toBe(400);
    expect(find).not.toHaveBeenCalled();
  });

  it("rejects invalid reports before persistence and verifies target existence", async () => {
    const create = vi.spyOn(Report, "create");
    const res = response();
    await createReport(request({ body: { targetType: "comment", targetId: targetId, reason: "spam", reporter: targetId } }), res);
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("scopes report listing by admin-selected filters and includes a safe target preview", async () => {
    const report = { _id: reportId, targetType: "comment", targetId, toObject: () => ({ _id: reportId, targetType: "comment", targetId }) };
    const query = queryChain([report]);
    vi.spyOn(Report, "find").mockReturnValue(query);
    vi.spyOn(Report, "countDocuments").mockResolvedValue(1);
    const target = { _id: targetId, content: "reported comment", moderationStatus: "visible" };
    const select = vi.fn().mockResolvedValue(target);
    vi.spyOn(Comment, "findById").mockReturnValue({ select });
    const res = response();
    await listReports(request({ query: { status: "open", targetType: "comment" } }), res);
    expect(Report.find).toHaveBeenCalledWith({ status: "open", targetType: "comment" });
    expect(select).toHaveBeenCalledWith("content moderationStatus author targetType targetId");
    expect(res.body.data[0].target).toEqual(target);
  });

  it("hides reported content reversibly and records moderator and outcome", async () => {
    const target = { _id: targetId, moderationStatus: "visible", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Blog, "findById").mockResolvedValue(target);
    const report = { _id: reportId, targetType: "blog", targetId, status: "open", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    const audit = vi.spyOn(ModerationAction, "create").mockResolvedValue({});
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "hide", note: "Confirmed policy violation" } }), res);
    expect(target.moderationStatus).toBe("hidden");
    expect(report.status).toBe("resolved");
    expect(report.moderatedBy).toBe(actorId);
    expect(report.moderatedAt).toBeInstanceOf(Date);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ actor: actorId, action: "content_hidden", targetType: "blog", targetId, report: reportId }));

    report.status = "reviewing";
    target.moderationStatus = "hidden";
    const restoreResponse = response();
    await moderateReport(request({ params: { reportId }, body: { action: "restore" } }), restoreResponse);
    expect(target.moderationStatus).toBe("visible");
    expect(audit).toHaveBeenLastCalledWith(expect.objectContaining({ actor: actorId, action: "content_restored" }));
  });

  it("allows reports about users to be dismissed without a content action", async () => {
    const report = { _id: reportId, targetType: "user", targetId, status: "open", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    const audit = vi.spyOn(ModerationAction, "create").mockResolvedValue({});
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "dismiss", note: "No policy issue found" } }), res);
    expect(res.statusCode).toBe(200);
    expect(report.status).toBe("dismissed");
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "report_dismissed", targetType: "user" }));
  });
});
