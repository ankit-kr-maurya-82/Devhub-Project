import mongoose from "mongoose";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

const replyPopulate = { path: "replyTo", select: "_id content sender isDeleted", populate: { path: "sender", select: "name username avatar" } };

const redactDeletedReply = (reply) => {
  if (reply?.isDeleted) reply.content = "This message was deleted";
};

const createMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ success: false, message: "Invalid room ID" });
    const room = await Room.findById(roomId).select("members");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((member) => member.equals(req.user._id))) return res.status(403).json({ success: false, message: "Only room members can send messages" });

    if (!req.body || typeof req.body.content !== "string") return res.status(400).json({ success: false, message: "Message content is required" });
    const content = req.body.content.trim();
    if (!content || content.length > 2000) return res.status(400).json({ success: false, message: "Message content must be between 1 and 2000 characters" });
    const messageType = req.body.messageType ?? "text";
    if (!["text", "image", "file"].includes(messageType)) return res.status(400).json({ success: false, message: "Invalid message type" });

    let replyTo = null;
    if (req.body.replyTo !== undefined && req.body.replyTo !== null) {
      if (typeof req.body.replyTo !== "string" || !mongoose.isValidObjectId(req.body.replyTo)) return res.status(400).json({ success: false, message: "Invalid replyTo message ID" });
      const parent = await Message.findById(req.body.replyTo).select("_id room");
      if (!parent) return res.status(404).json({ success: false, message: "Reply target message not found" });
      if (!parent.room.equals(room._id)) return res.status(400).json({ success: false, message: "Reply target must belong to the same room" });
      replyTo = parent._id;
    }

    const message = await Message.create({ room: room._id, sender: req.user._id, content, messageType, replyTo });
    await message.populate([
      { path: "sender", select: "name username avatar" },
      replyPopulate,
    ]);
    redactDeletedReply(message.replyTo);
    return res.status(201).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("Create Message Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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
      Message.find(filter).populate("sender", "name username avatar").populate(replyPopulate).sort({ createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      Message.countDocuments(filter),
    ]);
    const visibleMessages = messages.map((message) => {
      const data = message.toObject();
      if (data.isDeleted) data.content = "This message was deleted";
      redactDeletedReply(data.replyTo);
      return data;
    });
    return res.status(200).json({ success: true, data: visibleMessages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get Room Messages Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!mongoose.isValidObjectId(messageId)) return res.status(400).json({ success: false, message: "Invalid message ID" });
    if (!req.body || typeof req.body.content !== "string") return res.status(400).json({ success: false, message: "Message content is required" });
    const content = req.body.content.trim();
    if (!content || content.length > 2000) return res.status(400).json({ success: false, message: "Message content must be between 1 and 2000 characters" });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (!message.sender.equals(req.user._id)) return res.status(403).json({ success: false, message: "You can only edit your own messages" });
    if (message.isDeleted) return res.status(400).json({ success: false, message: "Deleted messages cannot be edited" });
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();
    await message.populate([{ path: "sender", select: "name username avatar" }, replyPopulate]);
    redactDeletedReply(message.replyTo);
    return res.status(200).json({ success: true, message: "Message updated successfully", data: message });
  } catch (error) {
    console.error("Edit Message Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!mongoose.isValidObjectId(messageId)) return res.status(400).json({ success: false, message: "Invalid message ID" });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    const room = await Room.findById(message.room).select("owner");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!message.sender.equals(req.user._id) && !room.owner.equals(req.user._id)) return res.status(403).json({ success: false, message: "You are not allowed to delete this message" });
    if (!message.isDeleted) {
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = "This message was deleted";
      await message.save();
    }
    return res.status(200).json({ success: true, message: "Message deleted successfully", data: { messageId: message._id, roomId: message.room, isDeleted: true, deletedAt: message.deletedAt } });
  } catch (error) {
    console.error("Delete Message Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const toggleMessageReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!mongoose.isValidObjectId(messageId)) return res.status(400).json({ success: false, message: "Invalid message ID" });
    if (!req.body || typeof req.body.emoji !== "string") return res.status(400).json({ success: false, message: "Emoji is required" });
    const emoji = req.body.emoji.trim();
    if (!emoji || emoji.length > 10) return res.status(400).json({ success: false, message: "Emoji must be between 1 and 10 characters" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    const room = await Room.findById(message.room).select("members");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((member) => member.equals(req.user._id))) return res.status(403).json({ success: false, message: "Only room members can react to messages" });
    if (message.isDeleted) return res.status(400).json({ success: false, message: "Cannot react to a deleted message" });

    const existingIndex = message.reactions.findIndex((reaction) => reaction.user.equals(req.user._id) && reaction.emoji === emoji);
    if (existingIndex >= 0) message.reactions.splice(existingIndex, 1);
    else message.reactions.push({ user: req.user._id, emoji });
    await message.save();
    return res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      data: { messageId: message._id, reactions: message.reactions },
    });
  } catch (error) {
    console.error("Toggle Message Reaction Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createMessage, getRoomMessages, editMessage, deleteMessage, toggleMessageReaction };
