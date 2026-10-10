import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createServer } from "node:http";
import { app } from "../src/app.js";
import User from "../src/models/user.model.js";
import Question from "../src/models/question.model.js";
import Answer from "../src/models/answer.model.js";
import Room from "../src/models/room.model.js";
import Message from "../src/models/message.model.js";
import Notification from "../src/models/notification.model.js";
import { validateEnvironment } from "../src/config/env.js";

const secret = "vitest-only-devhub-secret";
const userId = "507f1f77bcf86cd799439011";
const otherId = "507f191e810c19729de860ea";
const questionId = "507f1f77bcf86cd799439012";
const answerId = "507f1f77bcf86cd799439013";
const roomId = "507f1f77bcf86cd799439014";
const messageId = "507f1f77bcf86cd799439015";
let server;
let baseUrl;

const tokenFor = (id = userId) => jwt.sign({ userId: id }, secret, { expiresIn: "10m" });
const authHeaders = (id = userId) => ({ authorization: `Bearer ${tokenFor(id)}` });
const jsonRequest = (path, { method = "GET", token = userId, body } = {}) => fetch(`${baseUrl}${path}`, {
  method,
  headers: {
    ...(token ? authHeaders(token) : {}),
    ...(body === undefined ? {} : { "content-type": "application/json" }),
  },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

const withEnvironment = async (values, callback) => {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  try {
    await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

const requestFromOrigin = (origin, path = "/api-docs.json", options = {}) => fetch(`${baseUrl}${path}`, {
  ...options,
  headers: { ...(options.headers || {}), Origin: origin },
});

const makeQuery = (result) => {
  const query = {
    select: vi.fn(() => query),
    populate: vi.fn(() => query),
    sort: vi.fn(() => query),
    skip: vi.fn(() => query),
    limit: vi.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe("startup environment validation", () => {
  const validDevelopmentEnv = {
    NODE_ENV: "development",
    MONGODB_URI: "mongodb://127.0.0.1:27017/devhub_test",
    JWT_SECRET: "test-only-secret",
  };

  it("accepts the existing MONGODB_URI name and the MONGO_URI compatibility alias", () => {
    expect(validateEnvironment(validDevelopmentEnv)).toMatchObject({
      port: 4000,
      mongoUri: validDevelopmentEnv.MONGODB_URI,
    });
    expect(validateEnvironment({
      NODE_ENV: "development", MONGO_URI: "mongodb+srv://example.invalid/devhub", JWT_SECRET: "test",
    }).mongoUri).toBe("mongodb+srv://example.invalid/devhub");
  });

  it("rejects invalid ports, MongoDB URI values, and conflicting URI aliases", () => {
    for (const PORT of ["0", "65536", "4000abc", "1.5"]) {
      expect(() => validateEnvironment({ ...validDevelopmentEnv, PORT })).toThrow(/PORT/);
    }
    expect(() => validateEnvironment({ ...validDevelopmentEnv, MONGODB_URI: "https://example.invalid" })).toThrow(/MONGODB_URI/);
    expect(() => validateEnvironment({ ...validDevelopmentEnv, MONGODB_URI: "mongodb://" })).toThrow(/MONGODB_URI/);
    expect(() => validateEnvironment({
      ...validDevelopmentEnv, MONGO_URI: "mongodb://different.invalid/db",
    })).toThrow(/Set only one/);
  });

  it("requires a production JWT secret and explicit non-wildcard origins", () => {
    const base = {
      ...validDevelopmentEnv,
      NODE_ENV: "production",
      JWT_SECRET: "production-test-secret-0123456789",
      CLIENT_ORIGIN: "https://app.example.invalid,https://admin.example.invalid",
    };
    expect(validateEnvironment(base).allowedOrigins).toHaveLength(2);
    expect(() => validateEnvironment({ ...base, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
    expect(() => validateEnvironment({ ...base, JWT_SECRET: "                                " })).toThrow(/JWT_SECRET/);
    expect(() => validateEnvironment({ ...base, JWT_SECRET: "replace_with_a_long_random_secret" })).toThrow(/JWT_SECRET/);
    expect(() => validateEnvironment({ ...base, CLIENT_ORIGIN: "" })).toThrow(/CLIENT_ORIGIN/);
    expect(() => validateEnvironment({ ...base, CLIENT_ORIGIN: "*" })).toThrow(/CLIENT_ORIGIN/);
    expect(() => validateEnvironment({ ...base, CLIENT_ORIGIN: "https://app.example.invalid/path" })).toThrow(/CLIENT_ORIGIN/);
  });
});

beforeAll(async () => {
  process.env.JWT_SECRET = secret;
  server = createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(User, "findById").mockImplementation((id) => makeQuery({
    _id: String(id), username: "reader", email: "reader@example.invalid", isActive: true,
  }));
});

afterAll(async () => {
  vi.restoreAllMocks();
  await new Promise((resolve) => server.close(resolve));
});

describe("HTTP API integration with mocked persistence", () => {
  it("allows same-origin Swagger requests from the local backend origin", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User.prototype, "save").mockImplementation(async function save() {
      this._id = userId;
    });
    await withEnvironment({ NODE_ENV: "development", PORT: "4000", CLIENT_ORIGIN: "http://localhost:3000" }, async () => {
      const response = await requestFromOrigin("http://localhost:4000", "/api/v1/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "cors-user", email: "cors@example.invalid", password: "secret-pass" }),
      });
      expect(response.status).toBe(201);
      expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:4000");
      expect(response.headers.get("access-control-allow-credentials")).toBe("true");
    });
  });

  it("allows configured frontend origins and rejects other browser origins", async () => {
    await withEnvironment({ NODE_ENV: "development", CLIENT_ORIGIN: "https://frontend.example.test" }, async () => {
      const allowed = await requestFromOrigin("https://frontend.example.test");
      expect(allowed.status).toBe(200);
      expect(allowed.headers.get("access-control-allow-origin")).toBe("https://frontend.example.test");

      const rejected = await requestFromOrigin("https://attacker.example.test");
      expect(rejected.status).toBe(403);
      expect((await rejected.json()).message).toBe("Origin not allowed");
      expect(rejected.headers.get("access-control-allow-origin")).toBeNull();
    });
  });

  it("allows requests without Origin without emitting wildcard CORS headers", async () => {
    const response = await fetch(`${baseUrl}/api-docs.json`);
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
  });

  it("answers allowed CORS preflight requests and keeps production origins explicit", async () => {
    await withEnvironment({ NODE_ENV: "development", PORT: "4000", CLIENT_ORIGIN: "" }, async () => {
      const preflight = await requestFromOrigin("http://localhost:4000", "/api/v1/auth/register", {
        method: "OPTIONS",
        headers: {
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type,authorization",
        },
      });
      expect(preflight.status).toBe(204);
      expect(preflight.headers.get("access-control-allow-origin")).toBe("http://localhost:4000");
      expect(preflight.headers.get("access-control-allow-credentials")).toBe("true");
      expect(preflight.headers.get("access-control-allow-methods")).toContain("POST");
      expect(preflight.headers.get("access-control-allow-headers")).toContain("content-type");
    });

    await withEnvironment({ NODE_ENV: "production", PORT: "4000", CLIENT_ORIGIN: "https://production.example.test" }, async () => {
      const productionOrigin = await requestFromOrigin("https://production.example.test");
      expect(productionOrigin.status).toBe(200);
      expect(productionOrigin.headers.get("access-control-allow-origin")).toBe("https://production.example.test");
      const localOrigin = await requestFromOrigin("http://localhost:4000");
      expect(localOrigin.status).toBe(403);
    });
  });

  it("registers a user, hashes the password, and sets an HttpOnly JWT cookie", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    let created;
    vi.spyOn(User.prototype, "save").mockImplementation(async function save() {
      created = this;
      this._id = userId;
    });
    const response = await jsonRequest("/api/v1/auth/register", {
      method: "POST", token: null,
      body: { username: "reader", email: "reader@example.invalid", password: "secret-pass" },
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    const body = await response.json();
    expect(body.user.email).toBe("reader@example.invalid");
    expect(created.password).not.toBe("secret-pass");
    expect(await bcrypt.compare("secret-pass", created.password)).toBe(true);
  });

  it("logs in valid credentials and rejects invalid credentials", async () => {
    const hash = await bcrypt.hash("secret-pass", 4);
    vi.spyOn(User, "findOne").mockImplementation(() => makeQuery({
      _id: userId, username: "reader", email: "reader@example.invalid", password: hash,
    }));
    const accepted = await jsonRequest("/api/v1/auth/login", {
      method: "POST", token: null, body: { email: "reader@example.invalid", password: "secret-pass" },
    });
    expect(accepted.status).toBe(200);
    expect(accepted.headers.get("set-cookie")).toMatch(/token=/);
    const acceptedBody = await accepted.json();
    expect(acceptedBody).not.toHaveProperty("password");
    expect(JSON.stringify(acceptedBody)).not.toContain(secret);

    const denied = await jsonRequest("/api/v1/auth/login", {
      method: "POST", token: null, body: { email: "reader@example.invalid", password: "wrong" },
    });
    expect(denied.status).toBe(400);
    expect((await denied.json()).message).toMatch(/invalid/i);
  });

  it("logs out by clearing the authentication cookie", async () => {
    const response = await jsonRequest("/api/v1/auth/logout", { method: "GET", token: null });
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(/token=/);
    expect(response.headers.get("set-cookie")).toMatch(/(Expires=Thu, 01 Jan 1970|Max-Age=0)/i);
    expect(JSON.stringify(await response.json())).not.toContain(secret);
  });

  it("does not leak the configured JWT secret or submitted password during registration", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User.prototype, "save").mockImplementation(async function save() { this._id = userId; });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const password = "password-canary-not-for-response";
    const response = await jsonRequest("/api/v1/auth/register", {
      method: "POST", token: null,
      body: { username: "private-reader", email: "private@example.invalid", password },
    });
    const responseText = await response.text();
    expect(response.status).toBe(201);
    expect(responseText).not.toContain(secret);
    expect(responseText).not.toContain(password);
    expect(errorLog.mock.calls.flat().join(" ")).not.toContain(secret);
    expect(errorLog.mock.calls.flat().join(" ")).not.toContain(password);
  });

  it("does not log credential-bearing database errors or include them in login responses", async () => {
    const password = "login-password-canary";
    vi.spyOn(User, "findOne").mockRejectedValue(new Error(`database failure with ${password} and ${secret}`));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await jsonRequest("/api/v1/auth/login", {
      method: "POST", token: null, body: { email: "reader@example.invalid", password },
    });
    const responseText = await response.text();
    const logText = errorLog.mock.calls.flat().join(" ");
    expect(response.status).toBe(500);
    expect(responseText).not.toContain(password);
    expect(responseText).not.toContain(secret);
    expect(logText).not.toContain(password);
    expect(logText).not.toContain(secret);
  });

  it("requires a valid active-user JWT for protected routes", async () => {
    for (const token of [null, "invalid", jwt.sign({ userId }, secret, { expiresIn: -1 })]) {
      const response = await jsonRequest("/api/v1/auth/dashboard", { token });
      expect(response.status).toBe(401);
    }
    vi.spyOn(User, "findById").mockImplementation(() => makeQuery({ _id: userId, isActive: false }));
    expect((await jsonRequest("/api/v1/user/profile/" + userId)).status).toBe(401);
  });

  it("serves Swagger UI and the generated OpenAPI JSON", async () => {
    const ui = await fetch(`${baseUrl}/api-docs`);
    expect(ui.status).toBe(200);
    const page = await fetch(`${baseUrl}/api-docs/`);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("Swagger UI");
    const response = await fetch(`${baseUrl}/api-docs.json`);
    expect(response.status).toBe(200);
    const spec = await response.json();
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths["/api/v1/rooms/{roomId}/messages"].post).toBeDefined();
    expect(spec.components.securitySchemes.cookieAuth.in).toBe("cookie");
    expect(spec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
  });

  it("returns a public profile without private fields", async () => {
    vi.spyOn(User, "findById").mockImplementation(() => makeQuery({
      _id: userId, username: "reader", bio: "hello", isActive: true,
    }));
    const response = await jsonRequest(`/api/v1/user/profile/${userId}`);
    expect(response.status).toBe(200);
    expect((await response.json()).data).not.toHaveProperty("password");
    expect(User.findById.mock.results.at(-1).value.select).toHaveBeenCalledWith("name username bio avatar skills reputation isOnline lastSeen createdAt");
  });

  it("updates only the authenticated user's profile and rejects body-supplied identity", async () => {
    const updated = { _id: userId, name: "Updated Reader", username: "reader" };
    const updateProfile = vi.spyOn(User, "findByIdAndUpdate").mockImplementation(() => makeQuery(updated));
    const response = await jsonRequest("/api/v1/user/profile", { method: "PUT", body: { name: "Updated Reader" } });
    expect(response.status).toBe(200);
    expect(updateProfile).toHaveBeenCalledWith(userId, { name: "Updated Reader" }, { new: true, runValidators: true });

    const spoofed = await jsonRequest("/api/v1/user/profile", {
      method: "PUT", body: { name: "Someone else", userId: otherId },
    });
    expect(spoofed.status).toBe(400);
    expect(updateProfile).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid IDs before question persistence and blocks edits by non-owners", async () => {
    const invalid = await jsonRequest("/api/v1/questions/invalid");
    expect(invalid.status).toBe(400);
    const question = { _id: questionId, author: otherId };
    vi.spyOn(Question, "findById").mockResolvedValue(question);
    const forbidden = await jsonRequest(`/api/v1/questions/${questionId}`, {
      method: "PATCH", body: { title: "A replacement question title" },
    });
    expect(forbidden.status).toBe(403);
  });

  it("blocks question deletion by a non-owner", async () => {
    const question = { _id: questionId, author: otherId, deleteOne: vi.fn() };
    vi.spyOn(Question, "findById").mockResolvedValue(question);
    const response = await jsonRequest(`/api/v1/questions/${questionId}`, { method: "DELETE" });
    expect(response.status).toBe(403);
    expect(question.deleteOne).not.toHaveBeenCalled();
  });

  it("blocks a non-owner from accepting an answer and confirms answer edit/delete routes are absent", async () => {
    vi.spyOn(Question, "findById").mockResolvedValue({ _id: questionId, author: otherId });
    const findAnswer = vi.spyOn(Answer, "findById");
    const forbidden = await jsonRequest(`/api/v1/questions/${questionId}/answers/${answerId}/accept`, { method: "PATCH" });
    expect(forbidden.status).toBe(403);
    expect(findAnswer).not.toHaveBeenCalled();

    const edit = await jsonRequest(`/api/v1/questions/${questionId}/answers/${answerId}`, {
      method: "PATCH", body: { content: "Unauthorized edit" },
    });
    const remove = await jsonRequest(`/api/v1/questions/${questionId}/answers/${answerId}`, { method: "DELETE" });
    expect(edit.status).toBe(404);
    expect(remove.status).toBe(404);
  });

  it("creates questions with the authenticated user as author", async () => {
    const created = { _id: questionId, title: "A useful question title", author: userId };
    vi.spyOn(Question, "create").mockResolvedValue(created);
    const response = await jsonRequest("/api/v1/questions", {
      method: "POST", body: { title: created.title, description: "Details", author: otherId, tags: [" JS "] },
    });
    expect(response.status).toBe(201);
    expect(Question.create).toHaveBeenCalledWith(expect.objectContaining({ author: userId, tags: ["js"] }));
  });

  it("creates answers using the authenticated user and question route", async () => {
    vi.spyOn(Question, "findById").mockResolvedValue({ _id: questionId, author: otherId });
    vi.spyOn(Answer, "create").mockResolvedValue({ _id: answerId, content: "An answer", populate: vi.fn() });
    vi.spyOn(Question, "updateOne").mockResolvedValue({ modifiedCount: 1 });
    vi.spyOn(Notification, "create").mockResolvedValue({});
    const response = await jsonRequest(`/api/v1/questions/${questionId}/answers`, {
      method: "POST", body: { content: "An answer", author: otherId },
    });
    expect(response.status).toBe(201);
    expect(Answer.create).toHaveBeenCalledWith(expect.objectContaining({ author: userId, question: questionId }));
  });

  it("creates a room with its owner/member derived from the authenticated user", async () => {
    const created = { _id: roomId, populate: vi.fn() };
    vi.spyOn(Room, "create").mockResolvedValue(created);
    const response = await jsonRequest("/api/v1/rooms", {
      method: "POST", body: { name: "Test room", owner: otherId, members: [otherId] },
    });
    expect(response.status).toBe(201);
    expect(Room.create).toHaveBeenCalledWith(expect.objectContaining({ owner: userId, members: [userId] }));
  });

  it("rejects non-members from sending messages and does not trust sender IDs", async () => {
    vi.spyOn(Room, "findById").mockImplementation(() => makeQuery({
      _id: roomId,
      isPublic: false,
      members: [{ equals: (id) => String(id) === otherId }],
    }));
    const createMessage = vi.spyOn(Message, "create");
    const response = await jsonRequest(`/api/v1/rooms/${roomId}/messages`, {
      method: "POST", body: { content: "Unauthorized", sender: userId },
    });
    expect(response.status).toBe(403);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it("blocks non-owners from editing or deleting another member's message", async () => {
    const message = {
      _id: messageId,
      room: roomId,
      sender: { equals: (id) => String(id) === otherId },
      isDeleted: false,
      save: vi.fn(),
    };
    vi.spyOn(Message, "findById").mockResolvedValue(message);
    vi.spyOn(Room, "findById").mockImplementation(() => makeQuery({
      owner: { equals: (id) => String(id) === otherId },
      members: [{ equals: (id) => String(id) === userId }],
    }));

    const edit = await jsonRequest(`/api/v1/messages/${messageId}`, {
      method: "PATCH", body: { content: "Unauthorized edit" },
    });
    expect(edit.status).toBe(403);
    const remove = await jsonRequest(`/api/v1/messages/${messageId}`, { method: "DELETE" });
    expect(remove.status).toBe(403);
    expect(message.save).not.toHaveBeenCalled();
  });

  it("prevents non-members from reading a private room", async () => {
    const privateRoom = {
      _id: roomId,
      isPublic: false,
      members: [{ _id: { equals: (id) => String(id) === otherId } }],
      toObject() { return { _id: roomId, isPublic: false }; },
    };
    vi.spyOn(Room, "findById").mockImplementation(() => makeQuery(privateRoom));
    const response = await jsonRequest(`/api/v1/rooms/${roomId}`);
    expect(response.status).toBe(403);
  });

  it("rate limits password-reset requests", async () => {
    let lastResponse;
    for (let attempt = 0; attempt < 41; attempt += 1) {
      lastResponse = await jsonRequest("/api/v1/auth/forgot-password", {
        method: "POST", token: null, body: {},
      });
    }
    expect(lastResponse.status).toBe(429);
  });

  it("returns validation errors for malformed question bodies", async () => {
    const response = await jsonRequest("/api/v1/questions", { method: "POST", body: { title: "short", description: "" } });
    expect(response.status).toBe(400);
  });
});
