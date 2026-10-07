import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { 
    type: String, required: true, trim: true, maxlength: 2000 },
  messageType: { 
    type: String, enum: ["text", "image", "file", "system"], default: "text" },
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
