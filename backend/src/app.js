import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { handleJsonParseError, handleError } from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import openapiSpecification from "./docs/openapi.js";

const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // The API and Swagger UI share an origin in local development. Never add
  // this implicit local origin in production; production uses CLIENT_ORIGIN only.
  if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || "4000";
    configuredOrigins.push(`http://localhost:${port}`);
  }

  return new Set(configuredOrigins);
};

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../src/views"));

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Non-browser clients have no Origin and do not use CORS. Let them proceed
    // without emitting wildcard CORS headers, including with credentials enabled.
    if (!origin) return callback(null, false);
    if (getAllowedOrigins().has(origin)) return callback(null, true);
    const error = new Error("Origin not allowed");
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
}));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "../public"))
);

app.get("/api-docs.json", (req, res) => res.json(openapiSpecification));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification, {
  explorer: false,
  swaggerOptions: { persistAuthorization: false },
}));

app.get("/", (req, res) => {
  res.render("home");
});



// import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import questionRoutes from "./routes/question.routes.js";
import answerRoutes, { answerVoteRouter } from "./routes/answer.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import roomRoutes from "./routes/room.routes.js";
import presenceRoutes from "./routes/presence.routes.js";
import messageRoutes from "./routes/message.routes.js";

app.use(`/api/v1/auth`, authRoutes);
app.use(`/api/v1/user`, userRoutes);
app.use("/api/v1/users", presenceRoutes);
app.use(handleJsonParseError);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/questions", answerRoutes);
app.use("/api/v1/answers", answerVoteRouter);
app.use("/api/v1", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use(handleError);


export  {app};
