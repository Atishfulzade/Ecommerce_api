import mongoose from "mongoose";

export const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you want to reference a User model
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Assuming you want to reference a Product model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true } // Corrected the option here
);

// Export the model
export const Review = mongoose.model("Review", reviewSchema);
