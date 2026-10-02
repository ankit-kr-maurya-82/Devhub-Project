import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    votes: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    answerCount: {
      type: Number,
      default: 0,
    },

    isSolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;