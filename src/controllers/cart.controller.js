import { Cart } from "../models/cartSchema.models.js";
import mongoose from "mongoose";

// Helper function to validate ObjectID format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get cart for a user
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Use the authenticated user ID

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.products.length === 0) {
      return res.status(200).json({ message: "Cart is empty", products: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: error.message });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Use authenticated user ID

    if (!isValidObjectId(productId) || quantity == null || quantity <= 0) {
      return res.status(400).json({
        message: "Valid product ID and quantity are required",
      });
    }

    // Find the cart and update or create if it doesn't exist (upsert)
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId }, // Create cart if not exists
        $inc: { "products.$[elem].quantity": quantity }, // Update quantity
      },
      {
        new: true, // Return the modified document
        upsert: true, // Create if it doesn't exist
        arrayFilters: [{ "elem.productId": productId }], // Only update specific product
      }
    );

    // If the cart is new (created by upsert) and no product found, add it manually
    if (
      !updatedCart ||
      !updatedCart.products.find((p) => p.productId.toString() === productId)
    ) {
      const newCart = await Cart.findOneAndUpdate(
        { userId },
        { $push: { products: { productId, quantity } } }, // Add new product if not exists
        { new: true }
      );
      return res
        .status(201)
        .json({ message: "Product added to cart", cart: newCart });
    }

    res
      .status(200)
      .json({ message: "Product quantity updated", cart: updatedCart });
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    res
      .status(500)
      .json({ message: "Failed to add product to cart", error: error.message });
  }
};

// Update cart item quantity
export const editCartItem = async (req, res) => {
  try {
    const updatedCartProduct = req.body;
    const [productId, quantity] = updatedCartProduct;
    const userId = req.user.id; // Use authenticated user ID
    console.log(productId, quantity);

    if (!isValidObjectId(productId) || quantity == null || quantity <= 0) {
      return res.status(400).json({
        message: "Valid product ID and quantity are required",
      });
    }

    // Find the cart and update quantity for the specified product
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { "products.$[elem].quantity": quantity } }, // Update quantity
      {
        new: true, // Return updated cart
        arrayFilters: [{ "elem.productId": productId }], // Only update specific product
      }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res
      .status(200)
      .json({ message: "Cart item updated successfully", cart: updatedCart });
  } catch (error) {
    console.error("Failed to update cart item:", error);
    res
      .status(500)
      .json({ message: "Failed to update cart item", error: error.message });
  }
};

// Delete a product from the cart
export const deleteCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // Use authenticated user ID

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    // Find the cart and remove the product using $pull
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } }, // Remove product from cart
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      message: "Product removed from cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Failed to delete product from cart:", error);
    res.status(500).json({
      message: "Failed to delete product from cart",
      error: error.message,
    });
  }
};
