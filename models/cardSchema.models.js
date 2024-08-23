import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      // Note: Consider encryption for sensitive data
    },
    cardholderName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
      // Consider a format like MM/YYYY
    },
    cvv: {
      type: String,
      required: true,
      // Note: Consider encryption for sensitive data
    },
  },
  {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields
  }
);

export const Card = mongoose.model("Card", cardSchema);
