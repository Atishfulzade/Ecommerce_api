import mongoose from "mongoose";

export const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches your user model name
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
          ref: "Product", // Ensure this matches your product model name
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // Quantity should be at least 1
        },
      },
    ],
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt fields

export const Cart = mongoose.model("Cart", cartSchema);
