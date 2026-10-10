import dotenv from "dotenv"
import "dotenv/config";
import { createServer } from "node:http";
import {app} from "./app.js";
import connectDB from "./db/index.js";
import initializeSocket from "./socket/socket.js";

dotenv.config({
    path: './.env'
})
const PORT = process.env.PORT || 4000;
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error("Startup requires JWT_SECRET and MONGODB_URI.");
  process.exit(1);
}
const configuredOrigins = (process.env.CLIENT_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === "production" && configuredOrigins.length === 0) {
  console.error("Production startup requires CLIENT_ORIGIN.");
  process.exit(1);
}
const httpServer = createServer(app);
initializeSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running at port : ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });

