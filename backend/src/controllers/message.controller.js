import mongoose from "mongoose";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ success: false, message: "Invalid room ID" });
    const room = await Room.findById(roomId).select("_id members");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((member) => member.equals(req.user._id))) return res.status(403).json({ success: false, message: "Only room members can access messages" });
    const parsePositive = (value, fallback) => {
      if (value === undefined) return fallback;
      if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
      const number = Number(value);
      return Number.isSafeInteger(number) ? number : null;
    };
    const page = parsePositive(req.query.page, 1);
    const limit = parsePositive(req.query.limit, 50);
    if (!page || !limit || limit > 100 || !Number.isSafeInteger((page - 1) * limit)) return res.status(400).json({ success: false, message: "page and limit must be positive integers; limit must not exceed 100" });
    const filter = { room: room._id };
    const [messages, total] = await Promise.all([
      Message.find(filter).populate("sender", "name username avatar").sort({ createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      Message.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get Room Messages Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getRoomMessages };
