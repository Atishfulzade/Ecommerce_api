import mongoose from "mongoose";
import { addressSchema } from "./addressSchema.models.js"; // Importing shared address schema

const supplierSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    mobile: {
      type: String,
      required: true,
      match: /^\+\d{1,15}$/i,
      maxlength: 10,
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
    address: [addressSchema], // If you want multiple addresses, otherwise use 'address: addressSchema'
    vatNumber: {
      type: String,
      required: true,
      unique: true,
    },
    contactPerson: {
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
    },
    role: {
      type: String,
      enum: ["admin", "supplier"], // Corrected roles
      default: "supplier", // Default role set to 'supplier'
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
  },
  { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
