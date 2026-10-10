import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { handleJsonParseError, handleError } from "./middlewares/error.middleware.js";

const allowedOrigins = (process.env.CLIENT_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../src/views"));

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  const error = new Error("Origin not allowed");
  error.status = 403;
  return callback(error);
}, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "../public"))
);

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
app.use("/", authRoutes);
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
