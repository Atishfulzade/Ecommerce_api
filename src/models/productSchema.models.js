import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category_id: { type: Number },
    category_name: { type: mongoose.Schema.Types.String, ref: "Category" }, // Reference to Category model
    min_catalog_price: { type: Number },
    min_product_price: { type: Number },
    description: { type: String, required: true },
    full_details: { type: String },
    share_text: { type: String },
    type: { type: String },
    suppliers: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model

    image: { type: String },
    collage_image: { type: String },
    collage_image_aspect_ratio: { type: Number },
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
      absolute_average_rating: { type: Number },
      average_rating_str: { type: String },
      rating_scale: { type: Number },
      review_count: { type: Number },
      rating_count: { type: Number },
    },
    shipping: {
      charges: { type: Number },
      discount: { type: Number },
      show_shipping_charges: { type: Boolean },
      show_free_delivery: { type: Boolean },
    },
    product_images: [
      {
        id: { type: Number },
        url: { type: String },
      },
    ],
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
