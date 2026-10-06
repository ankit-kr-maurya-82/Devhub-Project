import mongoose from "mongoose";
import Answer from "../models/answer.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Vote from "../models/vote.model.js";
import Notification from "../models/notification.model.js";
import createNotification from "../utils/createNotification.js";

const scoreValue = (voteType) => (voteType === "upvote" ? 1 : -1);

const reputationValue = (targetType, voteType) => {
  if (voteType === "upvote") {
    return targetType === "Question" ? 5 : 10;
  }
  return -2;
};

const voteOnTarget = async ({ req, res, targetType, TargetModel, idParam }) => {
  const targetId = req.params[idParam];
  const { voteType } = req.body;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${targetType.toLowerCase()} ID`,
    });
  }

  if (voteType !== "upvote" && voteType !== "downvote") {
    return res.status(400).json({
      success: false,
      message: "voteType must be upvote or downvote",
    });
  }

  // Ensure the collection and its unique index exist before opening a transaction.
  await Vote.init();
  const session = await mongoose.startSession();
  let response;
  let upvoteNotification;

  try {
    await session.withTransaction(async () => {
      const target = await TargetModel.findById(targetId).session(session);
      if (!target) {
        response = {
          status: 404,
          body: {
            success: false,
            message: `${targetType} not found`,
          },
        };
        return;
      }

      if (target.author.toString() === req.user._id.toString()) {
        response = {
          status: 400,
          body: {
            success: false,
            message: "You cannot vote on your own content",
          },
        };
        return;
      }

      const existingVote = await Vote.findOne({
        user: req.user._id,
        targetType,
        targetId,
      }).session(session);

      let scoreDelta;
      let reputationDelta;
      let message;

      if (!existingVote) {
        const vote = new Vote({
          user: req.user._id,
          targetType,
          targetId,
          voteType,
        });
        await vote.save({ session });
        if (voteType === "upvote") {
          upvoteNotification = {
            recipient: target.author,
            sender: req.user._id,
            type: targetType === "Question" ? "question_upvote" : "answer_upvote",
            message: targetType === "Question"
              ? "Someone upvoted your question."
              : "Someone upvoted your answer.",
            relatedQuestion: targetType === "Question" ? target._id : target.question,
            relatedAnswer: targetType === "Answer" ? target._id : undefined,
          };
        }
        scoreDelta = scoreValue(voteType);
        reputationDelta = reputationValue(targetType, voteType);
        message = `${voteType === "upvote" ? "Upvote" : "Downvote"} recorded`;
      } else if (existingVote.voteType === voteType) {
        scoreDelta = -scoreValue(existingVote.voteType);
        reputationDelta = -reputationValue(targetType, existingVote.voteType);
        await existingVote.deleteOne({ session });
        message = "Vote removed";
      } else {
        scoreDelta = scoreValue(voteType) - scoreValue(existingVote.voteType);
        reputationDelta =
          reputationValue(targetType, voteType) -
          reputationValue(targetType, existingVote.voteType);
        existingVote.voteType = voteType;
        await existingVote.save({ session });
        if (voteType === "upvote") {
          upvoteNotification = {
            recipient: target.author,
            sender: req.user._id,
            type: targetType === "Question" ? "question_upvote" : "answer_upvote",
            message: targetType === "Question"
              ? "Someone upvoted your question."
              : "Someone upvoted your answer.",
            relatedQuestion: targetType === "Question" ? target._id : target.question,
            relatedAnswer: targetType === "Answer" ? target._id : undefined,
          };
        }
        message = "Vote changed";
      }

      await TargetModel.updateOne(
        { _id: targetId },
        { $inc: { votes: scoreDelta } },
        { session }
      );

      if (reputationDelta !== 0) {
        const author = await User.findById(target.author).session(session);
        if (author) {
          author.reputation = Math.max(
            0,
            (author.reputation || 0) + reputationDelta
          );
          await author.save({ session });
        }
      }

      const updatedTarget = await TargetModel.findById(targetId)
        .select("votes")
        .session(session);
      response = {
        status: 200,
        body: {
          success: true,
          message,
          votes: updatedTarget.votes,
        },
      };
    });

    if (upvoteNotification) {
      const notificationFilter = {
        recipient: upvoteNotification.recipient,
        sender: upvoteNotification.sender,
        type: upvoteNotification.type,
        ...(upvoteNotification.relatedQuestion && { relatedQuestion: upvoteNotification.relatedQuestion }),
        ...(upvoteNotification.relatedAnswer && { relatedAnswer: upvoteNotification.relatedAnswer }),
      };
      if (!(await Notification.exists(notificationFilter))) {
        await createNotification(upvoteNotification);
      }
    }

    return res.status(response.status).json(response.body);
  } finally {
    await session.endSession();
  }
};

const voteQuestion = async (req, res) => {
  try {
    return await voteOnTarget({
      req,
      res,
      targetType: "Question",
      TargetModel: Question,
      idParam: "questionId",
    });
  } catch (error) {
    console.error("Vote Question Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const voteAnswer = async (req, res) => {
  try {
    return await voteOnTarget({
      req,
      res,
      targetType: "Answer",
      TargetModel: Answer,
      idParam: "answerId",
    });
  } catch (error) {
    console.error("Vote Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { voteQuestion, voteAnswer };
