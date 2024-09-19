import mongoose from "mongoose";

export const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name is required
  imageURL: { type: String },
});

export const Category = mongoose.model("Category", categorySchema);
