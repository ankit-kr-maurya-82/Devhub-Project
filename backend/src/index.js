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

