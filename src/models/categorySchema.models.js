import mongoose from "mongoose";

export const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name is required
  imageURL: { type: String }, // Can add validation if needed
});

export const Category = mongoose.model("Category", categorySchema);
