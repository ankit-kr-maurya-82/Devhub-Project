import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../src/models/user.model.js";
import Question from "../src/models/question.model.js";
import Answer from "../src/models/answer.model.js";
import Comment from "../src/models/comment.model.js";
import Notification from "../src/models/notification.model.js";
import Room from "../src/models/room.model.js";
import { loginUser, registerUser } from "../src/controllers/auth.controller.js";
import { authMiddleware } from "../src/middlewares/auth.middleware.js";
import { validateEnvironment } from "../src/config/env.js";
import { createQuestion, updateQuestion } from "../src/controllers/question.controller.js";
import { createAnswer, acceptAnswer } from "../src/controllers/answer.controller.js";
import { updateComment } from "../src/controllers/comment.controller.js";
import { leaveRoom } from "../src/controllers/room.controller.js";
import createNotification from "../src/utils/createNotification.js";
import { disconnectUserSockets, setNotificationSocketServer } from "../src/socket/notificationDelivery.js";
import { joinRoomAndRecheckMembership } from "../src/socket/roomMembership.js";
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../src/controllers/notification.controller.js";

const secret = "controller-unit-test-secret";
const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f191e810c19729de860ea";
const questionId = "507f1f77bcf86cd799439012";
const answerId = "507f1f77bcf86cd799439013";
const commentId = "507f1f77bcf86cd799439014";
const notificationId = "507f1f77bcf86cd799439015";
const originalNodeEnv = process.env.NODE_ENV;

const makeResponse = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
  cookie: vi.fn(),
  clearCookie: vi.fn(),
});

const makeRequest = ({ body = {}, params = {}, user = { _id: userId, username: "reader" }, originalUrl = "/api/test", token } = {}) => ({
  body,
  params,
  user,
  originalUrl,
  cookies: token ? { token } : {},
  header: vi.fn(() => undefined),
});

describe("controller and middleware unit checks", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = secret;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setNotificationSocketServer(null);
    delete process.env.JWT_SECRET;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it("validates local and Atlas SRV MongoDB URI configuration without connecting", () => {
    const development = {
      NODE_ENV: "development",
      MONGODB_URI: "mongodb://127.0.0.1:27017/devhub_test",
      JWT_SECRET: secret,
    };

    expect(validateEnvironment(development).mongoUri).toBe(development.MONGODB_URI);
    expect(validateEnvironment({
      NODE_ENV: "development",
      MONGO_URI: "mongodb+srv://cluster.example.test/devhub",
      JWT_SECRET: secret,
    }).mongoUri).toBe("mongodb+srv://cluster.example.test/devhub");
    expect(validateEnvironment({
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:27017/devhub_test",
      JWT_SECRET: secret,
    }).mongoUri).toBe("mongodb://127.0.0.1:27017/devhub_test");
    expect(() => validateEnvironment({ ...development, NODE_ENV: undefined })).toThrow(/NODE_ENV/);
    expect(() => validateEnvironment({ ...development, NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });

  it("rejects production secrets and wildcard or malformed CORS origins", () => {
    const production = {
      NODE_ENV: "production",
      MONGODB_URI: "mongodb+srv://cluster.example.test/devhub",
      JWT_SECRET: "a-long-test-only-production-secret-value",
      CLIENT_ORIGIN: "https://app.example.test",
    };

    expect(validateEnvironment(production).allowedOrigins).toEqual([production.CLIENT_ORIGIN]);
    expect(() => validateEnvironment({ ...production, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
    expect(() => validateEnvironment({ ...production, CLIENT_ORIGIN: "*" })).toThrow(/CLIENT_ORIGIN/);
    expect(() => validateEnvironment({ ...production, CLIENT_ORIGIN: "https://app.example.test/path" })).toThrow(/CLIENT_ORIGIN/);
    expect(() => validateEnvironment({ ...production, CLIENT_ORIGIN: "http://app.example.test" })).toThrow(/CLIENT_ORIGIN/);
  });

  it("rejects invalid registration fields before querying persistence", async () => {
    const findOne = vi.spyOn(User, "findOne");
    const response = makeResponse();

    await registerUser(makeRequest({ body: { username: "reader", email: "reader@example.test", password: "short" } }), response);

    expect(response.statusCode).toBe(400);
    expect(findOne).not.toHaveBeenCalled();
  });

  it("hashes a registered password and sets a production-only HttpOnly secure cookie", async () => {
    process.env.NODE_ENV = "production";
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User.prototype, "save").mockResolvedValue(undefined);
    const response = makeResponse();

    await registerUser(makeRequest({ body: {
      name: "Reader",
      username: "reader",
      email: "reader@example.test",
      password: "long-enough-password",
    } }), response);

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeUndefined();
    const [cookieName, token, cookieOptions] = response.cookie.mock.calls[0];
    expect(cookieName).toBe("token");
    expect(cookieOptions).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax" });
    expect(jwt.verify(token, secret).userId).toBeTruthy();
    const savedUser = User.prototype.save.mock.instances[0];
    expect(savedUser.password).not.toBe("long-enough-password");
    expect(await bcrypt.compare("long-enough-password", savedUser.password)).toBe(true);
  });

  it("authenticates only a matching password and issues a signed cookie", async () => {
    process.env.NODE_ENV = "production";
    const passwordHash = await bcrypt.hash("correct-password", 4);
    const user = {
      _id: userId,
      username: "reader",
      email: "reader@example.test",
      password: passwordHash,
      role: "user",
      isActive: true,
    };
    const select = vi.fn().mockResolvedValue(user);
    vi.spyOn(User, "findOne").mockReturnValue({ select });
    const response = makeResponse();

    await loginUser(makeRequest({ body: { email: user.email, password: "correct-password" } }), response);

    expect(response.statusCode).toBe(200);
    expect(select).toHaveBeenCalledWith("+password");
    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body.token).toBeUndefined();
    const [, token, cookieOptions] = response.cookie.mock.calls[0];
    expect(jwt.verify(token, secret).userId).toBe(userId);
    expect(cookieOptions).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax" });
  });

  it("rejects login for a suspended account without issuing a token", async () => {
    const user = { _id: userId, email: "reader@example.test", password: await bcrypt.hash("correct-password", 4), isActive: false };
    vi.spyOn(User, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    const response = makeResponse();

    await loginUser(makeRequest({ body: { email: user.email, password: "correct-password" } }), response);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Invalid email or password/);
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it("rejects requests without a JWT and clears the stale cookie", async () => {
    const response = makeResponse();
    const next = vi.fn();

    await authMiddleware(makeRequest(), response, next);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.clearCookie).toHaveBeenCalledWith("token");
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches an active user only after verifying the JWT", async () => {
    const user = { _id: userId, username: "reader", isActive: true };
    const query = { select: vi.fn().mockResolvedValue(user) };
    const findById = vi.spyOn(User, "findById").mockReturnValue(query);
    const req = makeRequest({ token: jwt.sign({ userId }, secret) });
    const next = vi.fn();

    await authMiddleware(req, makeResponse(), next);

    expect(findById).toHaveBeenCalledWith(userId);
    expect(query.select).toHaveBeenCalledWith("-password");
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects authenticated requests for suspended accounts", async () => {
    const suspendedUser = { _id: userId, isActive: false };
    vi.spyOn(User, "findById").mockReturnValue({ select: vi.fn().mockResolvedValue(suspendedUser) });
    const response = makeResponse();
    const next = vi.fn();

    await authMiddleware(makeRequest({ token: jwt.sign({ userId }, secret) }), response, next);

    expect(response.statusCode).toBe(401);
    expect(response.clearCookie).toHaveBeenCalledWith("token");
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects malformed and expired JWTs without querying for a user", async () => {
    const findById = vi.spyOn(User, "findById");
    const expiredToken = jwt.sign({ userId }, secret, { expiresIn: -1 });

    for (const token of ["not-a-jwt", expiredToken]) {
      const response = makeResponse();
      const next = vi.fn();
      await authMiddleware(makeRequest({ token }), response, next);
      expect(response.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    }

    expect(findById).not.toHaveBeenCalled();
  });

  it("creates a question using the authenticated author and normalized tags", async () => {
    const created = { _id: questionId };
    const create = vi.spyOn(Question, "create").mockResolvedValue(created);
    const response = makeResponse();

    await createQuestion(makeRequest({ body: {
      title: "How should this behave?",
      description: "A useful description",
      tags: [" React ", "react", "Node"],
      author: otherUserId,
    } }), response);

    expect(response.statusCode).toBe(201);
    expect(create).toHaveBeenCalledWith({
      title: "How should this behave?",
      description: "A useful description",
      tags: ["react", "node"],
      author: userId,
    });
  });

  it("prevents a non-owner from updating a question", async () => {
    const findById = vi.spyOn(Question, "findById").mockResolvedValue({ author: otherUserId });
    const findByIdAndUpdate = vi.spyOn(Question, "findByIdAndUpdate");
    const response = makeResponse();

    await updateQuestion(makeRequest({ params: { questionId }, body: { title: "Changed title" } }), response);

    expect(response.statusCode).toBe(403);
    expect(findById).toHaveBeenCalledWith(questionId);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("creates an answer for the path question and authenticated user", async () => {
    const question = { _id: questionId, author: otherUserId };
    const answer = { _id: answerId, populate: vi.fn() };
    vi.spyOn(Question, "findById").mockResolvedValue(question);
    const create = vi.spyOn(Answer, "create").mockResolvedValue(answer);
    vi.spyOn(Question, "updateOne").mockResolvedValue({ modifiedCount: 1 });
    vi.spyOn(Notification, "create").mockResolvedValue({ _id: notificationId });
    const response = makeResponse();

    await createAnswer(makeRequest({ params: { questionId }, body: { content: "  A considered answer  ", author: otherUserId } }), response);

    expect(response.statusCode).toBe(201);
    expect(create).toHaveBeenCalledWith({ content: "A considered answer", author: userId, question: questionId });
    expect(answer.populate).toHaveBeenCalledWith("author", "name username avatar reputation");
  });

  it("prevents a non-owner from accepting an answer before looking it up", async () => {
    const findById = vi.spyOn(Question, "findById").mockResolvedValue({ author: otherUserId });
    const findAnswer = vi.spyOn(Answer, "findById");
    const response = makeResponse();

    await acceptAnswer(makeRequest({ params: { questionId, answerId } }), response);

    expect(response.statusCode).toBe(403);
    expect(findById).toHaveBeenCalledWith(questionId);
    expect(findAnswer).not.toHaveBeenCalled();
  });

  it("prevents a non-owner from changing a comment", async () => {
    const save = vi.fn();
    vi.spyOn(Comment, "findById").mockResolvedValue({ author: otherUserId, save });
    const response = makeResponse();

    await updateComment(makeRequest({ params: { commentId }, body: { content: "Changed" } }), response);

    expect(response.statusCode).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });

  it("persists notifications and emits only a minimal payload to the recipient room", async () => {
    const notification = {
      _id: notificationId,
      recipient: otherUserId,
      type: "answer",
      message: "A user answered your question.",
      relatedQuestion: questionId,
      isRead: false,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const create = vi.spyOn(Notification, "create").mockResolvedValue(notification);
    const emit = vi.fn();
    const socketServer = { to: vi.fn(() => ({ emit })) };
    setNotificationSocketServer(socketServer);

    const created = await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: "answer",
      message: notification.message,
      relatedQuestion: questionId,
    });

    expect(created).toBe(notification);
    expect(create).toHaveBeenCalledWith({
      recipient: otherUserId,
      sender: userId,
      type: "answer",
      message: notification.message,
      relatedQuestion: questionId,
      relatedAnswer: undefined,
      relatedComment: undefined,
    });
    expect(socketServer.to).toHaveBeenCalledWith(`user:${otherUserId}`);
    expect(emit).toHaveBeenCalledWith("notificationCreated", expect.objectContaining({
      _id: notificationId,
      type: "answer",
      message: notification.message,
      relatedQuestion: questionId,
      isRead: false,
    }));
    expect(emit.mock.calls[0][1]).not.toHaveProperty("recipient");
    expect(emit.mock.calls[0][1]).not.toHaveProperty("sender");
  });

  it("disconnects every socket in a suspended user's private room", () => {
    const disconnectSockets = vi.fn();
    const socketServer = { in: vi.fn(() => ({ disconnectSockets })) };
    setNotificationSocketServer(socketServer);

    disconnectUserSockets(otherUserId);

    expect(socketServer.in).toHaveBeenCalledWith(`user:${otherUserId}`);
    expect(disconnectSockets).toHaveBeenCalledWith(true);
  });

  it("removes a leaving user's sockets from the room after membership is saved", async () => {
    const events = [];
    const roomId = "507f1f77bcf86cd799439016";
    const room = {
      _id: roomId,
      owner: { equals: (id) => id === otherUserId },
      members: [{ equals: (id) => id === userId }],
      save: vi.fn(async () => { events.push("saved"); }),
    };
    const socketsLeave = vi.fn((id) => { events.push(`left:${id}`); });
    const socketServer = { in: vi.fn(() => ({ socketsLeave })) };
    vi.spyOn(Room, "findById").mockResolvedValue(room);
    setNotificationSocketServer(socketServer);
    const response = makeResponse();

    await leaveRoom(makeRequest({ params: { roomId } }), response);

    expect(response.statusCode).toBe(200);
    expect(room.save).toHaveBeenCalledOnce();
    expect(socketServer.in).toHaveBeenCalledWith(`user:${userId}`);
    expect(socketsLeave).toHaveBeenCalledWith(roomId);
    expect(events).toEqual(["saved", `left:${roomId}`]);
  });

  it("does not evict room sockets when membership persistence fails", async () => {
    const roomId = "507f1f77bcf86cd799439016";
    const room = {
      _id: roomId,
      owner: { equals: () => false },
      members: [{ equals: (id) => id === userId }],
      save: vi.fn().mockRejectedValue(new Error("save failed")),
    };
    const socketsLeave = vi.fn();
    setNotificationSocketServer({ in: vi.fn(() => ({ socketsLeave })) });
    vi.spyOn(Room, "findById").mockResolvedValue(room);
    const response = makeResponse();

    await leaveRoom(makeRequest({ params: { roomId } }), response);

    expect(response.statusCode).toBe(500);
    expect(socketsLeave).not.toHaveBeenCalled();
  });

  it("leaves a socket room when membership is revoked while the socket is joining", async () => {
    const events = [];
    const roomId = "507f1f77bcf86cd799439016";
    const socket = {
      join: vi.fn(async (id) => { events.push(`joined:${id}`); }),
      leave: vi.fn(async (id) => { events.push(`left:${id}`); }),
    };
    vi.spyOn(Room, "findById").mockReturnValue({
      select: vi.fn().mockResolvedValue({ members: [{ equals: () => false }] }),
    });

    const joined = await joinRoomAndRecheckMembership(socket, roomId, userId);

    expect(joined).toBe(false);
    expect(events).toEqual([`joined:${roomId}`, `left:${roomId}`]);
  });

  it("leaves a socket room when the post-join membership check fails", async () => {
    const roomId = "507f1f77bcf86cd799439016";
    const socket = { join: vi.fn(), leave: vi.fn() };
    vi.spyOn(Room, "findById").mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error("membership lookup failed")),
    });

    await expect(joinRoomAndRecheckMembership(socket, roomId, userId))
      .rejects.toThrow("membership lookup failed");

    expect(socket.leave).toHaveBeenCalledWith(roomId);
  });

  it("lists only the authenticated recipient's notifications using validated pagination", async () => {
    const query = {
      populate: vi.fn(() => query),
      sort: vi.fn(() => query),
      skip: vi.fn(() => query),
      limit: vi.fn(() => query),
      then: (resolve, reject) => Promise.resolve([{ _id: notificationId }]).then(resolve, reject),
    };
    const find = vi.spyOn(Notification, "find").mockReturnValue(query);
    const count = vi.spyOn(Notification, "countDocuments").mockResolvedValueOnce(1).mockResolvedValueOnce(4);
    const request = makeRequest();
    request.query = { page: "2", limit: "5", unread: "true" };
    const response = makeResponse();

    await getNotifications(request, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      unreadCount: 4,
      pagination: { page: 2, limit: 5, total: 1, totalPages: 1 },
    });
    expect(find).toHaveBeenCalledWith({ recipient: userId, isRead: false });
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.limit).toHaveBeenCalledWith(5);
    expect(count).toHaveBeenNthCalledWith(1, { recipient: userId, isRead: false });
    expect(count).toHaveBeenNthCalledWith(2, { recipient: userId, isRead: false });

    const invalidRequest = makeRequest();
    invalidRequest.query = { page: "0" };
    const invalidResponse = makeResponse();
    await getNotifications(invalidRequest, invalidResponse);
    expect(invalidResponse.statusCode).toBe(400);
  });

  it("returns unread counts only for the authenticated recipient", async () => {
    const countDocuments = vi.spyOn(Notification, "countDocuments").mockResolvedValue(3);
    const response = makeResponse();

    await getUnreadNotificationCount(makeRequest(), response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ success: true, unreadCount: 3 });
    expect(countDocuments).toHaveBeenCalledWith({ recipient: userId, isRead: false });
  });

  it("scopes notification read updates to the authenticated recipient", async () => {
    const query = { populate: vi.fn().mockResolvedValue(null) };
    const findOneAndUpdate = vi.spyOn(Notification, "findOneAndUpdate").mockReturnValue(query);
    const response = makeResponse();

    await markNotificationRead(makeRequest({ params: { notificationId } }), response);

    expect(response.statusCode).toBe(404);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } },
      { new: true, runValidators: true },
    );
  });

  it("scopes mark-all-read updates to the authenticated recipient", async () => {
    const updateMany = vi.spyOn(Notification, "updateMany").mockResolvedValue({ modifiedCount: 2 });
    const response = makeResponse();

    await markAllNotificationsRead(makeRequest(), response);

    expect(response.statusCode).toBe(200);
    expect(updateMany).toHaveBeenCalledWith(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );
  });

  it("scopes notification deletion to its authenticated recipient", async () => {
    const findOneAndDelete = vi.spyOn(Notification, "findOneAndDelete").mockResolvedValue(null);
    const response = makeResponse();

    await deleteNotification(makeRequest({ params: { notificationId } }), response);

    expect(response.statusCode).toBe(404);
    expect(findOneAndDelete).toHaveBeenCalledWith({ _id: notificationId, recipient: userId });
  });
});
