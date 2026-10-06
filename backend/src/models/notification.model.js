import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "answer", "comment", 
        "question_upvote", 
        "answer_upvote", 
        "accepted_answer", 
        "mention", "system"],
      required: true,
    },
    message: { 
      type: String, 
      required: true, 
      trim: true },
    relatedQuestion: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Question" },
    relatedAnswer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Answer" },
    relatedComment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Comment" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
