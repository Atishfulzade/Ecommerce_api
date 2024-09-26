import { Cart } from "../models/cartSchema.models.js";
import mongoose from "mongoose";

// Helper function to validate ObjectID format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get cart for a user
export const getCart = async (req, res) => {
  try {
    const { id } = req.user; // Use query params for userId

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const cart = await Cart.findOne({ id });

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
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
    const { userId, productId, quantity } = req.body;

    if (
      !userId ||
      !productId ||
      quantity == null ||
      !isValidObjectId(userId) ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message:
          "User ID, product ID, and quantity are required and must be valid",
      });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({ userId, products: [{ productId, quantity }] });
    } else {
      const productIndex = userCart.products.findIndex(
        (product) => product.productId.toString() === productId
      );

      if (productIndex > -1) {
        userCart.products[productIndex].quantity += quantity;
      } else {
        userCart.products.push({ productId, quantity });
      }
    }

    await userCart.save();
    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart: userCart });
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
    const { userId, productId, quantity } = req.body;

    if (
      !userId ||
      !productId ||
      quantity == null ||
      quantity <= 0 ||
      !isValidObjectId(userId) ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "User ID, product ID, and valid quantity are required",
      });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex > -1) {
      userCart.products[productIndex].quantity = quantity;

      await userCart.save();
      res
        .status(200)
        .json({ message: "Cart item updated successfully", cart: userCart });
    } else {
      res.status(404).json({ message: "Product not found in the cart" });
    }
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
    const { userId, productId } = req.body;

    if (
      !userId ||
      !productId ||
      !isValidObjectId(userId) ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "User ID and product ID are required and must be valid",
      });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex > -1) {
      userCart.products.splice(productIndex, 1);

      await userCart.save();
      res.status(200).json({
        message: "Product removed from cart successfully",
        cart: userCart,
      });
    } else {
      res.status(404).json({ message: "Product not found in the cart" });
    }
  } catch (error) {
    console.error("Failed to delete product from cart:", error);
    res.status(500).json({
      message: "Failed to delete product from cart",
      error: error.message,
    });
  }
};
