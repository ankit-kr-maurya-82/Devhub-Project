import { afterEach, describe, expect, it, vi } from "vitest";
import User from "../src/models/user.model.js";
import Blog from "../src/models/blog.model.js";
import Question from "../src/models/question.model.js";
import Answer from "../src/models/answer.model.js";
import Comment from "../src/models/comment.model.js";
import CodingProblem from "../src/models/codingProblem.model.js";
import Submission from "../src/models/submission.model.js";
import Report from "../src/models/report.model.js";
import ModerationAction from "../src/models/moderationAction.model.js";
import { getDashboard, listUsers, setUserActiveStatus, createReport, listReports, moderateReport } from "../src/controllers/admin.controller.js";
import { adminMiddleware } from "../src/middlewares/admin.middleware.js";
import { setNotificationSocketServer } from "../src/socket/notificationDelivery.js";

const actorId = "507f1f77bcf86cd799439011";
const targetId = "507f191e810c19729de860ea";
const reportId = "507f1f77bcf86cd799439012";
const response = () => ({ statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const request = ({ body = {}, params = {}, query = {}, id = actorId, role = "admin" } = {}) => ({ body, params, query, user: { _id: id, role } });
const queryChain = result => {
  const query = { select: vi.fn(() => query), populate: vi.fn(() => query), sort: vi.fn(() => query), skip: vi.fn(() => query), limit: vi.fn(() => Promise.resolve(result)) };
  return query;
};

afterEach(() => {
  vi.restoreAllMocks();
  setNotificationSocketServer(null);
});

describe("admin moderation unit checks", () => {
  it("denies non-admins at the backend authorization middleware", () => {
    const res = response(); const next = vi.fn();
    adminMiddleware(request({ role: "user" }), res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns database-backed overview counts and safe recent registrations", async () => {
    const recentUsers = [{ _id: targetId, name: "New member", username: "new_member", role: "user", isActive: true, createdAt: new Date() }];
    const usersQuery = queryChain(recentUsers);
    const recentActionsQuery = {
      sort: vi.fn(function sort() { return this; }),
      limit: vi.fn(function limit() { return this; }),
      populate: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(User, "countDocuments").mockImplementation(filter => Promise.resolve(
      filter.createdAt ? 3 : filter.isActive === true ? 8 : filter.isActive === false ? 2 : 10
    ));
    vi.spyOn(User, "find").mockReturnValue(usersQuery);
    vi.spyOn(Blog, "countDocuments").mockResolvedValue(4);
    vi.spyOn(Question, "countDocuments").mockResolvedValue(5);
    vi.spyOn(Answer, "countDocuments").mockResolvedValue(6);
    vi.spyOn(Comment, "countDocuments").mockResolvedValue(7);
    vi.spyOn(CodingProblem, "countDocuments").mockImplementation(filter => Promise.resolve(filter.status ? 9 : 11));
    vi.spyOn(Submission, "countDocuments").mockResolvedValue(12);
    vi.spyOn(Report, "countDocuments").mockResolvedValue(13);
    vi.spyOn(ModerationAction, "find").mockReturnValue(recentActionsQuery);
    const res = response();

    await getDashboard(request(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.counts).toEqual({
      totalUsers: 10,
      activeUsers: 8,
      suspendedUsers: 2,
      newUsersLast7Days: 3,
      totalBlogs: 4,
      totalQuestions: 5,
      totalAnswers: 6,
      totalComments: 7,
      totalCodingProblems: 11,
      publishedCodingProblems: 9,
      totalSubmissions: 12,
      openReports: 13,
    });
    expect(usersQuery.select).toHaveBeenCalledWith("name username role isActive createdAt");
    expect(res.body.data.recentUsers).toEqual(recentUsers);
    expect(res.body.data.recentUsers[0]).not.toHaveProperty("password");
    expect(User.countDocuments).toHaveBeenCalledWith({ createdAt: { $gte: expect.any(Date) } });
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

  it("prevents suspending any administrator so the last admin cannot be lost in a concurrent update", async () => {
    const user = { _id: targetId, role: "admin", isActive: true };
    vi.spyOn(User, "findById").mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    const update = vi.spyOn(User, "findOneAndUpdate");
    const res = response();
    await setUserActiveStatus(request({ params: { userId: targetId }, body: { isActive: false } }), res);
    expect(res.statusCode).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it("disconnects the user's live sockets after a successful account suspension", async () => {
    const user = { _id: targetId, role: "user", isActive: true };
    vi.spyOn(User, "findById").mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    vi.spyOn(ModerationAction, "findOne").mockReturnValue({ sort: vi.fn().mockResolvedValue(null) });
    vi.spyOn(ModerationAction, "create").mockResolvedValue({ save: vi.fn().mockResolvedValue(undefined) });
    vi.spyOn(User, "findOneAndUpdate").mockResolvedValue({ isActive: false });
    const disconnectSockets = vi.fn();
    const socketServer = { in: vi.fn(() => ({ disconnectSockets })) };
    setNotificationSocketServer(socketServer);
    const res = response();

    await setUserActiveStatus(request({ params: { userId: targetId }, body: { isActive: false } }), res);

    expect(res.statusCode).toBe(200);
    expect(socketServer.in).toHaveBeenCalledWith(`user:${targetId}`);
    expect(disconnectSockets).toHaveBeenCalledWith(true);
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
    const report = { _id: reportId, targetType: "blog", targetId, status: "open", moderationAction: null, save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    vi.spyOn(Report, "findOneAndUpdate").mockResolvedValue(report);
    const journal = { _id: "507f191e810c19729de860ee", actor: actorId, state: "pending", action: "content_hidden", note: "Confirmed policy violation", previousValue: "open", save: vi.fn().mockResolvedValue(undefined) };
    const audit = vi.spyOn(ModerationAction, "create").mockResolvedValue(journal);
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "hide", note: "Confirmed policy violation" } }), res);
    expect(target.moderationStatus).toBe("hidden");
    expect(report.status).toBe("resolved");
    expect(report.moderatedBy).toBe(actorId);
    expect(report.moderatedAt).toBeInstanceOf(Date);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ actor: actorId, action: "content_hidden", targetType: "blog", targetId, report: reportId, state: "pending" }));

    report.status = "reviewing";
    report.moderationAction = null;
    target.moderationStatus = "hidden";
    const restoreResponse = response();
    await moderateReport(request({ params: { reportId }, body: { action: "restore" } }), restoreResponse);
    expect(target.moderationStatus).toBe("visible");
    expect(audit).toHaveBeenLastCalledWith(expect.objectContaining({ actor: actorId, action: "content_restored" }));
  });

  it("allows reports about users to be dismissed without a content action", async () => {
    const report = { _id: reportId, targetType: "user", targetId, status: "open", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    const journal = { _id: "507f191e810c19729de860ee", actor: actorId, state: "pending", action: "report_dismissed", note: "No policy issue found", previousValue: "open", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findOneAndUpdate").mockResolvedValue(report);
    const audit = vi.spyOn(ModerationAction, "create").mockResolvedValue(journal);
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "dismiss", note: "No policy issue found" } }), res);
    expect(res.statusCode).toBe(200);
    expect(report.status).toBe("dismissed");
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "report_dismissed", targetType: "user" }));
  });

  it("keeps a report claimed and its audit journal pending after a target write failure", async () => {
    const journal = { _id: "507f191e810c19729de860ee", actor: actorId, state: "pending", action: "content_hidden", note: "", previousValue: "open", save: vi.fn().mockResolvedValue(undefined) };
    const report = { _id: reportId, targetType: "blog", targetId, status: "open", moderationAction: null, save: vi.fn().mockResolvedValue(undefined) };
    const target = { _id: targetId, moderationStatus: "visible", save: vi.fn().mockRejectedValueOnce(new Error("write failed")) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    vi.spyOn(Report, "findOneAndUpdate").mockResolvedValue(report);
    vi.spyOn(ModerationAction, "create").mockResolvedValue(journal);
    vi.spyOn(Blog, "findById").mockResolvedValue(target);
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "hide" } }), res);
    expect(res.statusCode).toBe(503);
    expect(report.status).toBe("processing");
    expect(journal.state).toBe("pending");
  });

  it("rejects repeated completed moderation actions without another audit write", async () => {
    const report = { _id: reportId, targetType: "blog", targetId, status: "resolved", moderationAction: "507f191e810c19729de860ee" };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    vi.spyOn(ModerationAction, "findById").mockResolvedValue({ state: "completed", action: "content_hidden" });
    const create = vi.spyOn(ModerationAction, "create");
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "hide" } }), res);
    expect(res.statusCode).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it("resumes a pending report action and completes its existing journal entry", async () => {
    const actionId = "507f191e810c19729de860ee";
    const journal = { _id: actionId, actor: actorId, state: "pending", action: "content_hidden", note: "", previousValue: "open", save: vi.fn().mockResolvedValue(undefined) };
    const report = { _id: reportId, targetType: "blog", targetId, status: "processing", moderationAction: actionId, save: vi.fn().mockResolvedValue(undefined) };
    const target = { _id: targetId, moderationStatus: "visible", save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Report, "findById").mockResolvedValue(report);
    vi.spyOn(ModerationAction, "findById").mockResolvedValue(journal);
    vi.spyOn(Blog, "findById").mockResolvedValue(target);
    const create = vi.spyOn(ModerationAction, "create");
    const res = response();
    await moderateReport(request({ params: { reportId }, body: { action: "hide" } }), res);
    expect(res.statusCode).toBe(200);
    expect(report.status).toBe("resolved");
    expect(journal.state).toBe("completed");
    expect(create).not.toHaveBeenCalled();
  });
});
