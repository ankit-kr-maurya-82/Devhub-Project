import process from "node:process";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user.model.js";
import CodingProblem from "../src/models/codingProblem.model.js";

function parseAndValidateUri(rawUri) {
  if (!rawUri || typeof rawUri !== "string") {
    throw new Error("Missing database connection URI. Set TEST_MONGODB_URI or MONGODB_URI.");
  }
  let parsed;
  try {
    parsed = new URL(rawUri);
  } catch {
    throw new Error("Invalid MongoDB URI format.");
  }
  if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) {
    throw new Error("URI must use mongodb: or mongodb+srv: protocol.");
  }
  const host = parsed.hostname;
  const isLoopback =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost") ||
    host.endsWith(".test");

  if (!isLoopback) {
    throw new Error("Disposable test database host must be localhost, 127.0.0.1, or a reserved .test host.");
  }

  const dbName = parsed.pathname.replace(/^\//, "").split("?")[0];
  if (!dbName || !/(?:test|disposable)/i.test(dbName)) {
    throw new Error("The target database name must contain 'test' or 'disposable' to prevent touching non-test databases.");
  }

  return { uri: rawUri, host: parsed.host, dbName };
}

async function seed() {
  if (process.env.DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB !== "YES") {
    throw new Error("Refusing to run: set DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES only for a disposable test database.");
  }

  const targetUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  const { uri, host, dbName } = parseAndValidateUri(targetUri);

  const userEmail = (process.env.E2E_USER_EMAIL || "").trim().toLowerCase();
  const userPassword = process.env.E2E_USER_PASSWORD || "";
  const adminEmail = (process.env.E2E_ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.E2E_ADMIN_PASSWORD || "";
  const problemSlug = (process.env.E2E_PROBLEM_SLUG || "").trim().toLowerCase();

  const missing = [];
  if (!userEmail) missing.push("E2E_USER_EMAIL");
  if (!userPassword) missing.push("E2E_USER_PASSWORD");
  if (!adminEmail) missing.push("E2E_ADMIN_EMAIL");
  if (!adminPassword) missing.push("E2E_ADMIN_PASSWORD");
  if (!problemSlug) missing.push("E2E_PROBLEM_SLUG");

  if (missing.length > 0) {
    throw new Error(`Missing required E2E variables: ${missing.join(", ")}.`);
  }

  if (userEmail === adminEmail) {
    throw new Error("E2E_USER_EMAIL and E2E_ADMIN_EMAIL must be different accounts.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problemSlug)) {
    throw new Error("E2E_PROBLEM_SLUG must be a lowercase slug containing alphanumeric characters and hyphens.");
  }

  if (userPassword.length < 8 || adminPassword.length < 8) {
    throw new Error("Test account passwords must be at least 8 characters long.");
  }

  await mongoose.connect(uri);
  console.log(`Connected to disposable database "${dbName}" on ${host}.`);

  const isClean = process.argv.includes("--clean");
  const isTeardown = process.argv.includes("--teardown");

  if (isTeardown) {
    console.log(`Dropping disposable database "${dbName}"...`);
    await mongoose.connection.dropDatabase();
    console.log("Database dropped successfully.");
    await mongoose.disconnect();
    return;
  }

  if (isClean) {
    console.log("Cleaning up seeded test users and coding problem...");
    await User.deleteMany({ email: { $in: [userEmail, adminEmail] } });
    await CodingProblem.deleteMany({ slug: problemSlug });
    console.log("Cleanup complete.");
    await mongoose.disconnect();
    return;
  }

  const [hashedUserPassword, hashedAdminPassword] = await Promise.all([
    bcrypt.hash(userPassword, 10),
    bcrypt.hash(adminPassword, 10),
  ]);

  const userUsername = userEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 20) || "e2e_user";
  const adminUsername = adminEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 20) || "e2e_admin";

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        name: "Dedicated E2E User",
        username: userUsername,
        email: userEmail,
        password: hashedUserPassword,
        role: "user",
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
  console.log(`Dedicated standard user seeded/updated: ${userEmail}`);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: "Dedicated E2E Admin",
        username: adminUsername,
        email: adminEmail,
        password: hashedAdminPassword,
        role: "admin",
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
  console.log(`Dedicated admin user seeded/updated: ${adminEmail}`);

  await CodingProblem.findOneAndUpdate(
    { slug: problemSlug },
    {
      $set: {
        title: "Two Sum Test Fixture",
        slug: problemSlug,
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "easy",
        topics: ["arrays", "hash-table"],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
        sampleTestCases: [
          {
            input: "nums = [2,7,11,15], target = 9",
            expectedOutput: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, return [0, 1].",
          },
        ],
        supportedLanguages: ["javascript", "python"],
        status: "published",
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
  console.log(`Published test coding problem seeded/updated: ${problemSlug}`);

  await mongoose.disconnect();
  console.log("Disposable test environment seed finished successfully.");
}

seed().catch((err) => {
  console.error(`Seed error: ${err.message}`);
  process.exit(1);
});

