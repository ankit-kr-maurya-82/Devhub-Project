import mongoose from "mongoose";

const connectDB = async (mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI) => {
  try {
    const connectionInstance = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed.");

    process.exit(1);
  }
};

export default connectDB;
