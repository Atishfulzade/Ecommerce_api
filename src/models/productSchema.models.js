import mongoose from "mongoose";
import { reviewSchema } from "./reviewSchema.models.js";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category_name: { type: mongoose.Schema.Types.String, ref: "Category" }, // Reference to Category model
    min_catalog_price: { type: Number },
    min_product_price: { type: Number },
    description: { type: String, required: true },
    full_details: { type: String },
    type: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, // Reference to User model

    trend: { type: String },
    popular: { type: Boolean },
    has_mrp: { type: Boolean },
    is_added_to_wishlist: { type: Boolean },
    assured_details: {
      is_assured: { type: Boolean },
      message: { type: String },
    },
    mall_verified: { type: Boolean },
    catalog_reviews_summary: {
      average_rating: { type: Number },
      review: [reviewSchema],
    },
    shipping: {
      charges: { type: Number },
      discount: { type: Number },
      show_shipping_charges: { type: Boolean },
      show_free_delivery: { type: Boolean },
    },
    product_images: [String],
    activated: { type: Date },
    num_shares: { type: String },

    price_type_id: { type: String },
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
