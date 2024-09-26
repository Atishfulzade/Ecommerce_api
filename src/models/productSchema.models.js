import mongoose from "mongoose";
import { reviewSchema } from "./reviewSchema.models.js";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Reference to Category model with ObjectId
    min_catalog_price: { type: Number },
    min_product_price: { type: Number },
    description: { type: String, required: true },
    full_details: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, // Reference to Supplier model
    trend: { type: String },
    popular: { type: Boolean },
    has_mrp: { type: Boolean },
    is_added_to_wishlist: { type: Boolean },
    assured_details: {
      is_assured: { type: Boolean },
      message: { type: String },
    }, // Changed to an object
    mall_verified: { type: Boolean },
    catalog_reviews_summary: {
      average_rating: { type: Number, default: 1 },
      review: [reviewSchema], // Assuming reviewSchema is correctly imported
    },
    shipping: {
      charges: { type: Number },
      discount: { type: Number },
      show_shipping_charges: { type: Boolean },
      show_free_delivery: { type: Boolean },
    },
    product_images: [String], // Array of image URLs
    available_stock: { type: Number },

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
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchema);
