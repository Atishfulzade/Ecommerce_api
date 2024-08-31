import mongoose from "mongoose";
import { addressSchema } from "./addressSchema.models.js";

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
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    // Supplier-specific fields (optional)
    companyName: {
      type: String,
      minlength: 3,
      maxlength: 100,
      // Conditional requirement based on role
      required: function () {
        return this.role === "supplier";
      },
    },
    vatNumber: {
      type: String,
      unique: true,
      required: function () {
        return this.role === "supplier";
      },
    },
    contactPerson: {
      firstname: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: function () {
          return this.role === "supplier";
        },
      },
      lastname: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: function () {
          return this.role === "supplier";
        },
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
