import mongoose from "mongoose";
import Answer from "../models/answer.model.js";
import Comment from "../models/comment.model.js";
import Question from "../models/question.model.js";
import createNotification from "../utils/createNotification.js";

const authorFields = "name username avatar reputation";

const invalidId = (id) => !mongoose.isValidObjectId(id);

const validateContent = (content) =>
  typeof content === "string" && content.trim().length >= 1 && content.trim().length <= 1000;

const addComment = async (req, res, targetType, TargetModel, idParam) => {
  try {
    const targetId = req.params[idParam];
    if (invalidId(targetId)) {
      return res.status(400).json({ success: false, message: `Invalid ${idParam}` });
    }
    if (!validateContent(req.body?.content)) {
      return res.status(400).json({ success: false, message: "Content must be between 1 and 1000 characters" });
    }
    const target = await TargetModel.findById(targetId).select("_id author question");
    if (!target) {
      return res.status(404).json({ success: false, message: `${targetType} not found` });
    }
    const comment = await Comment.create({
      content: req.body.content.trim(),
      author: req.user._id,
      targetType,
      targetId,
    });
    const relatedQuestion = targetType === "Question" ? target._id : target.question;
    await createNotification({
      recipient: target.author,
      sender: req.user._id,
      type: "comment",
      message: `${req.user.username || "Someone"} commented on your ${targetType.toLowerCase()}.`,
      relatedQuestion,
      relatedAnswer: targetType === "Answer" ? target._id : undefined,
      relatedComment: comment._id,
    });
    await comment.populate("author", authorFields);
    return res.status(201).json({ success: true, message: "Comment added successfully", data: comment });
  } catch (error) {
    console.error(`Add ${targetType} Comment Error:`, error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getComments = async (req, res, targetType, TargetModel, idParam) => {
  try {
    const targetId = req.params[idParam];
    if (invalidId(targetId)) {
      return res.status(400).json({ success: false, message: `Invalid ${idParam}` });
    }
    const target = await TargetModel.exists({ _id: targetId });
    if (!target) {
      return res.status(404).json({ success: false, message: `${targetType} not found` });
    }
    const comments = await Comment.find({ targetType, targetId })
      .populate("author", authorFields)
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    console.error(`Get ${targetType} Comments Error:`, error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const addQuestionComment = (req, res) => addComment(req, res, "Question", Question, "questionId");
const getQuestionComments = (req, res) => getComments(req, res, "Question", Question, "questionId");
const addAnswerComment = (req, res) => addComment(req, res, "Answer", Answer, "answerId");
const getAnswerComments = (req, res) => getComments(req, res, "Answer", Answer, "answerId");

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (invalidId(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid commentId" });
    }
    if (!req.body || Object.keys(req.body).some((key) => key !== "content")) {
      return res.status(400).json({ success: false, message: "Only content can be updated" });
    }
    if (!validateContent(req.body.content)) {
      return res.status(400).json({ success: false, message: "Content must be between 1 and 1000 characters" });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own comments" });
    }
    comment.content = req.body.content.trim();
    await comment.save();
    await comment.populate("author", authorFields);
    return res.status(200).json({ success: true, message: "Comment updated successfully", data: comment });
  } catch (error) {
    console.error("Update Comment Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (invalidId(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid commentId" });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own comments" });
    }
    await comment.deleteOne();
    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addQuestionComment, getQuestionComments, addAnswerComment, getAnswerComments, updateComment, deleteComment };
