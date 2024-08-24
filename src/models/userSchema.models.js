import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    minlength: 3,
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
  },
  zipCode: {
    type: String,
    required: true,
    match: /^[0-9]{5}(-[0-9]{4})?$/, // Example for US Zip Codes
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/, // Example for 10-digit numbers
  },
});

const userSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "default-profile.png", // Placeholder for default image
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
      maxlength: 50, // Adjust this value to a higher limit
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50, // Adjust this value to a higher limit
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
    address: [addressSchema], // Embedding addressSchema
    role: {
      type: String,
      enum: ["admin", "seller", "user"],
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
        ref: "Card", // Reference to Card model
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
