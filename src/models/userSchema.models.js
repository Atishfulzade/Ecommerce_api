import mongoose from "mongoose";
import { addressSchema } from "./addressSchema.models.js";
import { cartSchema } from "./cartSchema.models.js";

const userSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "default-profile.png",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9]+$/i,
      minlength: 6,
      maxlength: 20,
    },
    firstname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
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
    address: [addressSchema],
    role: {
      type: String,
      enum: ["admin", "supplier", "user"], // Defined roles
      default: "user",
    },
    otp: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    cart: [cartSchema],
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
