import mongoose from "mongoose";

export const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // Ensures each category has a unique numeric ID
  name: { type: String, required: true }, // Name is required
  imageURL: { type: String }, // Can add validation if needed
});

export const category = mongoose.model("Category", categorySchema);
