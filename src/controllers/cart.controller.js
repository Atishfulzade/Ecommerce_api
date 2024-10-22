import { Cart } from "../models/cartSchema.models.js";
import mongoose from "mongoose";

// Helper function to validate ObjectID format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to update or add a product in the cart
const updateCart = async (userId, productId, quantity) => {
  // Fetch the cart for the user
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // If the cart doesn't exist, create a new cart
    cart = new Cart({ userId, items: [] });
  }

  // Ensure cart.items is an array
  if (!Array.isArray(cart.items)) {
    cart.items = [];
  }

  // Check if the product is already in the cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    // If the product exists in the cart, update the quantity
    existingItem.quantity = quantity;
  } else {
    // If the product doesn't exist, add it to the cart
    cart.items.push({ productId, quantity });
  }

  // Save the updated cart
  await cart.save();

  return cart;
};

// Helper function to get the user's cart
const getUserCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  return cart ? cart : { items: [] };
};

// Get cart for a user
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const cart = await getUserCart(userId);

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: error.message });
  }
};

// Add or update products in the cart
export const addToCart = async (req, res) => {
  try {
    const cartItems = req.body; // Expecting an array of { itemId, quantity }
    const userId = req.user.id;

    // Validate that cartItems is an array
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Valid cart items are required" });
    }

    // Loop through each item in the cartItems array
    for (const item of cartItems) {
      const { itemId, quantity } = item;

      // Validate itemId and quantity for each item
      if (!isValidObjectId(itemId) || quantity == null || quantity <= 0) {
        return res.status(400).json({
          message: `Valid item ID and quantity are required for item ${itemId}`,
        });
      }

      // Update the cart with the item
      await updateCart(userId, itemId, quantity);
    }

    // Fetch the updated cart to send back in the response
    const updatedCart = await getUserCart(userId);

    res.status(200).json({
      message: "Products added or updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Failed to add or update products in cart:", error);
    res.status(500).json({
      message: "Failed to add or update products",
      error: error.message,
    });
  }
};

// Update cart item quantity
export const editCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(productId) || quantity == null || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Valid product ID and quantity are required" });
    }

    const updatedCart = await updateCart(userId, productId, quantity);

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
export const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    console.log(req.body);

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
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
