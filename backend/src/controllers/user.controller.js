import User from "../models/user.model.js";
import mongoose from "mongoose";

const getProfile = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ success: false, message: "Invalid user ID" });
        const user = await User.findById(
            req.params.userId
        ).select("name username bio avatar skills reputation isOnline lastSeen createdAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, avatar, skills } = req.body ?? {};
    if (Object.keys(req.body ?? {}).some((key) => !["name", "username", "bio", "avatar", "skills"].includes(key))) return res.status(400).json({ success: false, message: "Unsupported profile field" });
    for (const [value, max, label] of [[name, 100, "name"], [username, 30, "username"], [bio, 300, "bio"], [avatar, 2048, "avatar"]]) {
      if (value !== undefined && (typeof value !== "string" || value.length > max)) return res.status(400).json({ success: false, message: `Invalid ${label}` });
    }
    if (username !== undefined && !/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ success: false, message: "Invalid username" });
    if (skills !== undefined && (!Array.isArray(skills) || skills.length > 30 || skills.some((skill) => typeof skill !== "string" || !skill.trim() || skill.length > 40))) return res.status(400).json({ success: false, message: "Invalid skills" });

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (skills !== undefined) updateData.skills = skills;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
    getProfile,
    updateProfile
};
