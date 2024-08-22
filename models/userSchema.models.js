import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profileImage: String,
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9]+$/i,
      minlength: 6,
      maxlength: 20,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/i,
      lowercase: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
