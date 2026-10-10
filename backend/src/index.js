import dotenv from "dotenv"
import "dotenv/config";
import { createServer } from "node:http";
import {app} from "./app.js";
import connectDB from "./db/index.js";
import initializeSocket from "./socket/socket.js";
import { validateEnvironment } from "./config/env.js";

dotenv.config({
    path: './.env'
})
let config;
try {
  config = validateEnvironment();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const httpServer = createServer(app);
initializeSocket(httpServer);

connectDB(config.mongoUri)
  .then(() => {
    httpServer.listen(config.port, () => {
      console.log(`Server is running at port : ${config.port}`);
    });
  })
  .catch(() => {
    console.error("Server startup failed while connecting to MongoDB.");
  });

