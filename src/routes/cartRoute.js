import express from "express";
import { verifyUser } from "../controllers/user.controller.js";
import {
  getCart,
  addToCart,
  editCartItem,
  deleteCartItem,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Get cart for the authenticated user
router.get("/", verifyUser, getCart);

// Add or update items in the cart
router.post("/", verifyUser, addToCart);

// Update the quantity of a cart item
router.put("/", verifyUser, editCartItem);

// Remove an item from the cart
router.delete("/", verifyUser, deleteCartItem);

export default router;
