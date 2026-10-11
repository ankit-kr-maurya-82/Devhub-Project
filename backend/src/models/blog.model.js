import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 120,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  content: { type: String, required: true, trim: true, minlength: 20, maxlength: 40000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }], default: [] },
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  moderationStatus: { type: String, enum: ["visible", "hidden"], default: "visible", index: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, status: 1, publishedAt: -1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
