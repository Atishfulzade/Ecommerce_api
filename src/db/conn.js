import mongoose from "mongoose";
export const connect = async () => {
  try {
    const db = await mongoose.connect("mongodb://localhost:27017/store");
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.log("Failed to connect to MongoDB");
  }
};
