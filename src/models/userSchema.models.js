import mongoose from "mongoose";
import { addressSchema } from "./addressSchema.models.js";

const userSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "uploads/user.png",
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
    address: addressSchema,
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
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    cards: [
      {
        cardNumber: String,
        cardholderName: String,
        expiryDate: String,
        cvv: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }, // Make sure this is required in the correct place
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
