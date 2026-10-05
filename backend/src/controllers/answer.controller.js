import mongoose from "mongoose";
import Answer from "../models/answer.model.js";
import Question from "../models/question.model.js";

const authorFields = "name username avatar reputation";

const createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer content is required",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const answer = await Answer.create({
      content: content.trim(),
      author: req.user._id,
      question: questionId,
    });

    await Question.updateOne(
      { _id: questionId },
      { $inc: { answerCount: 1 } }
    );

    await answer.populate("author", authorFields);

    return res.status(201).json({
      success: true,
      message: "Answer posted successfully",
      data: answer,
    });
  } catch (error) {
    console.error("Create Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const questionExists = await Question.exists({ _id: questionId });
    if (!questionExists) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", authorFields)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: answers.length,
      data: answers,
    });
  } catch (error) {
    console.error("Get Answers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(questionId) ||
      !mongoose.Types.ObjectId.isValid(answerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question or answer ID",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the question author can accept an answer",
      });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (answer.question.toString() !== questionId) {
      return res.status(400).json({
        success: false,
        message: "Answer does not belong to this question",
      });
    }

    await Answer.updateMany(
      { question: questionId },
      { $set: { isAccepted: false } }
    );

    answer.isAccepted = true;
    await answer.save();

    question.isSolved = true;
    await question.save();

    await answer.populate("author", authorFields);

    return res.status(200).json({
      success: true,
      message: "Answer accepted successfully",
      data: answer,
    });
  } catch (error) {
    console.error("Accept Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createAnswer, getAnswersByQuestion, acceptAnswer };
