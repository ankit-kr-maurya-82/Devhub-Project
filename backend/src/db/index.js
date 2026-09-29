import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
  "0.0.0.0" 
]);

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `MongoDB connected: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error.message
    );

    process.exit(1);
  }
};

export default connectDB;