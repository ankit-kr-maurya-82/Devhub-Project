import "dotenv/config";
import mongoose from "mongoose";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import User from "../src/models/user.model.js";

const email = process.argv[2]?.trim().toLowerCase();
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function promoteAdmin() {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: npm run admin:promote -- <existing-user-email>");
  }
  if (!mongoUri) {
    throw new Error("Set MONGODB_URI or MONGO_URI before promoting an administrator.");
  }
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("Administrator promotion requires an interactive terminal.");
  }

  await mongoose.connect(mongoUri);
  try {
    const user = await User.findOne({ email }).select("name username email role isActive");
    if (!user) throw new Error("No account exists for that email. Register a standard account first.");
    if (!user.isActive) throw new Error("Inactive accounts cannot be promoted.");
    if (user.role === "admin") {
      console.log("This account is already an administrator.");
      return;
    }

    const prompt = createInterface({ input: stdin, output: stdout });
    let confirmation;
    try {
      confirmation = await prompt.question(`Type PROMOTE ${email} to grant administrator access: `);
    } finally {
      prompt.close();
    }
    if (confirmation !== `PROMOTE ${email}`) {
      throw new Error("Confirmation did not match; no changes were made.");
    }

    const promotedUser = await User.findOneAndUpdate(
      { _id: user._id, role: "user", isActive: true },
      { $set: { role: "admin" } },
      { new: true, runValidators: true }
    ).select("name username email role isActive");
    if (!promotedUser) {
      throw new Error("Account status changed before promotion; no changes were made. Retry after reviewing the account.");
    }

    console.log(`Administrator access granted to ${promotedUser.email}. Sign in at /login and open /admin.`);
  } finally {
    await mongoose.disconnect();
  }
}

promoteAdmin().catch((error) => {
  console.error(`Administrator promotion failed: ${error.message}`);
  process.exitCode = 1;
});
