import mongoose from "mongoose";
import User from "../models/user.model.js";

const toPresenceData = (user) => ({
  userId: user._id,
  username: user.username,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
});

const getMyPresence = (req, res) => res.status(200).json({ success: true, data: toPresenceData(req.user) });

const getUserPresence = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(userId).select("username isOnline lastSeen");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: toPresenceData(user) });
  } catch (error) {
    console.error("Get User Presence Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getMyPresence, getUserPresence };
