import mongoose from "mongoose";

const executionMetadataSchema = new mongoose.Schema({
  status: { type: String, enum: ["unavailable", "queued", "completed", "failed"], default: "unavailable" },
  executed: { type: Boolean, default: false },
  runtimeMs: { type: Number, default: null, min: 0 },
  memoryKb: { type: Number, default: null, min: 0 },
  serviceReference: { type: String, default: null, maxlength: 200 },
  message: { type: String, default: "", maxlength: 500 },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "CodingProblem", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  language: { type: String, required: true, enum: ["javascript", "python", "java", "cpp"] },
  sourceCode: { type: String, required: true, minlength: 1, maxlength: 20000, select: false },
  verdict: { type: String, required: true, enum: ["unavailable", "pending", "accepted", "wrong_answer", "runtime_error", "compile_error", "time_limit_exceeded"], default: "unavailable", index: true },
  executionMetadata: { type: executionMetadataSchema, default: () => ({}) },
}, { timestamps: true });

submissionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Submission", submissionSchema);
