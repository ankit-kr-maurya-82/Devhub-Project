import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Question", "Answer"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  { timestamps: true }
);

voteSchema.index(
  { 
    user: 1, 
    targetType: 1, 
    targetId: 1 
  },
  { unique: true }
);

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
