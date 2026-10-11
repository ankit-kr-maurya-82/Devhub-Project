import mongoose from "mongoose";

const moderationActionSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true, enum: ["report_reviewed", "report_dismissed", "content_hidden", "content_restored", "user_suspended", "user_reactivated"] },
  targetType: { type: String, required: true, enum: ["blog", "question", "answer", "comment", "user"] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", default: null },
  note: { type: String, default: "", maxlength: 1000 },
}, { timestamps: true });

moderationActionSchema.index({ createdAt: -1 });

export default mongoose.model("ModerationAction", moderationActionSchema);
