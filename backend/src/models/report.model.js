import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  targetType: { type: String, required: true, enum: ["blog", "question", "answer", "comment", "user"], index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  reason: { type: String, required: true, trim: true, maxlength: 100 },
  details: { type: String, default: "", trim: true, maxlength: 2000 },
  status: { type: String, enum: ["open", "reviewing", "processing", "resolved", "dismissed"], default: "open", index: true },
  outcome: { type: String, default: "", maxlength: 1000 },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  moderatedAt: { type: Date, default: null },
  moderationAction: { type: mongoose.Schema.Types.ObjectId, ref: "ModerationAction", default: null },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1, status: 1 });

export default mongoose.model("Report", reportSchema);
