import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connect = async () => {
  try {
    // Correct the environment variable name and use a complete URI
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
};
