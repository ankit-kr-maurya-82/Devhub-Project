import mongoose from "mongoose";

const roomCategories = ["programming", "technology", "general", "career", "college", "gaming", "other"];

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 3, 
    maxlength: 100 
  },
  description: { 
    type: String, 
    default: "", 
    trim: true, 
    maxlength: 500 
  },
  category: { 
    type: String, 
    enum: roomCategories, 
    default: "general" 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  ],
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  maxMembers: { 
    type: Number, 
    default: 100, 
    min: 1 
  },
}, { timestamps: true }
);

roomSchema.index({ isPublic: 1, category: 1, createdAt: -1 });
roomSchema.index({ name: "text", description: "text" });

const Room = mongoose.model("Room", roomSchema);
export { roomCategories };
export default Room;
