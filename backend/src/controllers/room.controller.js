import mongoose from "mongoose";
import Room, { roomCategories } from "../models/room.model.js";

const parsePositive = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
};
const safeRoom = (query) => query.populate("owner", "name username avatar").populate("members", "name username avatar");

const createRoom = async (req, res) => {
  try {
    const { name, description, category, isPublic, maxMembers } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Name must be between 3 and 100 characters" });
    }
    if (category !== undefined && !roomCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid room category" });
    }
    if (description !== undefined && (typeof description !== "string" || description.length > 500)) {
      return res.status(400).json({ success: false, message: "Description must not exceed 500 characters" });
    }
    if (isPublic !== undefined && typeof isPublic !== "boolean") {
      return res.status(400).json({ success: false, message: "isPublic must be a boolean" });
    }
    if (maxMembers !== undefined && (!Number.isSafeInteger(maxMembers) || maxMembers < 1)) {
      return res.status(400).json({ success: false, message: "maxMembers must be a positive integer" });
    }
    const room = await Room.create({ name, description, category, isPublic, maxMembers, owner: req.user._id, members: [req.user._id] });
    await room.populate("owner", "name username avatar");
    return res.status(201).json({ success: true, message: "Room created successfully", data: room });
  } catch (error) {
    console.error("Create Room Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRooms = async (req, res) => {
  try {
    const page = parsePositive(req.query.page, 1);
    const limit = parsePositive(req.query.limit, 20);
    if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
      return res.status(400).json({ success: false, message: "page and limit must be positive integers; limit must not exceed 50" });
    }
    const filter = { isPublic: true };
    if (req.query.category !== undefined) {
      if (!roomCategories.includes(req.query.category)) return res.status(400).json({ success: false, message: "Invalid room category" });
      filter.category = req.query.category;
    }
    if (req.query.search !== undefined) {
      if (typeof req.query.search !== "string" || !req.query.search.trim()) return res.status(400).json({ success: false, message: "search must not be empty" });
      filter.$or = [
        { name: { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { description: { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }
    const [rooms, total] = await Promise.all([
      safeRoom(Room.find(filter)).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Room.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: rooms, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get Rooms Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ success: false, message: "Invalid room ID" });
    const room = await safeRoom(Room.findById(roomId));
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    return res.status(200).json({ success: true, data: { ...room.toObject(), memberCount: room.members.length } });
  } catch (error) {
    console.error("Get Room Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ success: false, message: "Invalid room ID" });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.members.some((member) => member.equals(req.user._id))) return res.status(400).json({ success: false, message: "You are already a member of this room" });
    if (room.members.length >= room.maxMembers) return res.status(400).json({ success: false, message: "Room is full" });
    if (!room.isPublic) return res.status(403).json({ success: false, message: "This room is private" });
    room.members.push(req.user._id);
    await room.save();
    await room.populate("owner", "name username avatar");
    await room.populate("members", "name username avatar");
    return res.status(200).json({ success: true, message: "Joined room successfully", data: room });
  } catch (error) {
    console.error("Join Room Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ success: false, message: "Invalid room ID" });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.owner.equals(req.user._id)) return res.status(400).json({ success: false, message: "The room owner cannot leave their own room" });
    const index = room.members.findIndex((member) => member.equals(req.user._id));
    if (index === -1) return res.status(400).json({ success: false, message: "You are not a member of this room" });
    room.members.splice(index, 1);
    await room.save();
    return res.status(200).json({ success: true, message: "Left room successfully", data: room });
  } catch (error) {
    console.error("Leave Room Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createRoom, getRooms, getRoomById, joinRoom, leaveRoom };
