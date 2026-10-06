import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

const getNotifications = async (req, res) => {
  try {
    const parsePositiveInteger = (value, fallback) => {
      if (value === undefined) return fallback;
      if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : null;
    };
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20);
    if (!page || !limit || limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
      return res.status(400).json({ success: false, message: "page and limit must be positive integers; limit must not exceed 50" });
    }
    if (req.query.unread !== undefined && req.query.unread !== "true" && req.query.unread !== "false") {
      return res.status(400).json({ success: false, message: "unread must be true or false" });
    }

    const filter = { recipient: req.user._id };
    if (req.query.unread === "true") filter.isRead = false;
    if (req.query.unread === "false") filter.isRead = true;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);
    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    ).populate("sender", "name username avatar");
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({ success: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification };
