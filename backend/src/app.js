import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { handleJsonParseError } from "./middlewares/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../src/views"));

app.use(express.json());
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

app.use(`/api/v1/auth`, authRoutes);
app.use(`/api/v1/user`, userRoutes);
app.use(handleJsonParseError);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/questions", answerRoutes);
app.use("/api/v1/answers", answerVoteRouter);
app.use("/api/v1", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);


export  {app};
