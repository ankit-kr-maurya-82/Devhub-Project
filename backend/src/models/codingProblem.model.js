import mongoose from "mongoose";

const sampleCaseSchema = new mongoose.Schema({
  input: { type: String, required: true, maxlength: 4000 },
  expectedOutput: { type: String, required: true, maxlength: 4000 },
  explanation: { type: String, default: "", maxlength: 1000 },
}, { _id: false });

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 20000 },
  difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"], index: true },
  topics: { type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }], default: [] },
  constraints: { type: [{ type: String, trim: true, maxlength: 500 }], default: [] },
  sampleTestCases: { type: [sampleCaseSchema], default: [] },
  supportedLanguages: { type: [{ type: String, enum: ["javascript", "python", "java", "cpp"] }], default: ["javascript"] },
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
}, { timestamps: true });

codingProblemSchema.index({ status: 1, difficulty: 1, createdAt: -1 });
codingProblemSchema.index({ status: 1, topics: 1, createdAt: -1 });

export default mongoose.model("CodingProblem", codingProblemSchema);
