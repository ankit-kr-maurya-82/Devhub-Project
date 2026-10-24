import "dotenv/config";
import mongoose from "mongoose";
import { resolveIndexCheckTarget, runIndexCheck } from "../src/db/index-checker.js";
import User from "../src/models/user.model.js";
import Question from "../src/models/question.model.js";
import Answer from "../src/models/answer.model.js";
import Comment from "../src/models/comment.model.js";
import Notification from "../src/models/notification.model.js";
import Room from "../src/models/room.model.js";
import Message from "../src/models/message.model.js";
import Blog from "../src/models/blog.model.js";
import CodingProblem from "../src/models/codingProblem.model.js";
import Submission from "../src/models/submission.model.js";
import Vote from "../src/models/vote.model.js";
import Report from "../src/models/report.model.js";
import ModerationAction from "../src/models/moderationAction.model.js";

const models = [
  User, Question, Answer, Comment, Notification, Room, Message, Blog,
  CodingProblem, Submission, Vote, Report, ModerationAction,
];

const testTarget = resolveIndexCheckTarget(process.env);

process.exitCode = await runIndexCheck({ mongoose, models, target: testTarget });
