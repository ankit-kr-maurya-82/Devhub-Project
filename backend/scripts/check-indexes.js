import "dotenv/config";
import mongoose from "mongoose";
import { compareDeclaredIndexes, resolveIndexCheckTarget } from "../src/db/index-checker.js";
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

mongoose.set("autoIndex", false);
let connected = false;
try {
  await mongoose.connect(testTarget.uri, { autoIndex: false, serverSelectionTimeoutMS: 10_000 });
  connected = true;
  console.log(`Read-only index comparison for test database '${testTarget.databaseName}'.`);
  const { hasDrift, results } = await compareDeclaredIndexes(models);
  for (const { modelName, toCreate, toDrop } of results) {
    console.log(`${modelName}: ${JSON.stringify({ toCreate, toDrop })}`);
  }
  if (hasDrift) {
    console.error("Index differences found. This command did not create or drop indexes.");
    process.exitCode = 1;
  } else {
    console.log("Declared and database indexes match. No indexes were changed.");
  }
} catch {
  console.error("Index comparison failed. No index changes were attempted.");
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect();
}
