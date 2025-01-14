import mongoose from "mongoose";
import { reviewSchema } from "./reviewSchema.models.js";

const ProductSchema = new mongoose.Schema(
  {
    // Basic Product Details
    name: { type: String, required: true },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Linked to Category collection
    category_name: { type: String, required: true },
    min_catalog_price: { type: Number, required: true },
    min_product_price: { type: Number, required: true },
    full_details: { type: String },

    // Supplier Reference
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // Product Features
    trend: { type: String },
    popular: { type: Boolean, default: false },
    has_mrp: { type: Boolean, default: false },
    is_added_to_wishlist: { type: Boolean, default: false },

    // Assured Details
    assured_details: {
      is_assured: { type: Boolean, default: false },
      message: { type: String },
    },

    mall_verified: { type: Boolean, default: false },

    // Reviews Summary
    catalog_reviews_summary: {
      average_rating: { type: Number, default: 1 },
      review: [reviewSchema], // Embedded review documents
    },

    // Shipping Details
    shipping: {
      charges: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      show_shipping_charges: { type: Boolean, default: false },
      show_free_delivery: { type: Boolean, default: false },
    },

    // Images
    product_images: { type: [String], required: true }, // Array of image URLs

    // Stock Information
    available_stock: { type: Number, required: true },

    // Special Offers
    special_offers: {
      display_text: { type: String },
      offers: [
        {
          type: { type: String },
          amount: { type: Number },
        },
      ],
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt timestamps
);

// Exporting the Product model
export const Product = mongoose.model("Product", ProductSchema);
