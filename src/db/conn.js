import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB:", db.connection.host);
  } catch (error) {
    console.error("Connection error:", error.message);
  }
};

// testConnection();
