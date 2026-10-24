import "dotenv/config";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import initializeSocket from "./socket/socket.js";
import { validateEnvironment } from "./config/env.js";

let config;
try {
  config = validateEnvironment();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const httpServer = createServer(app);
mongoose.set("autoIndex", config.nodeEnv !== "production");
const io = initializeSocket(httpServer, config.allowedOrigins);

try {
  await connectDB(config.mongoUri);
  httpServer.listen(config.port, "0.0.0.0", () => {
    console.log(`Server is running on port ${config.port}`);
  });
} catch {
  console.error("Server startup failed while connecting to MongoDB.");
  process.exitCode = 1;
}

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down.`);
  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10_000);
  forceExit.unref();
  io.close(async () => {
    try {
      await mongoose.disconnect();
      clearTimeout(forceExit);
    } catch {
      console.error("Database disconnect failed during shutdown.");
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
