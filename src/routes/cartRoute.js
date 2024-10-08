import express from "express";
import { verifyUser } from "../controllers/user.controller.js";
import {
  addToCart,
  deleteCart,
  editCartItem,
  getCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// GET - Fetch all items in the cart
router.get("/", verifyUser, getCart);

// POST - Add a new item to the cart
router.post("/:itemId", verifyUser, addToCart);

// PUT - Update a specific item in the cart
router.put("/:itemId", verifyUser, editCartItem);

// DELETE - Remove a specific item from the cart
router.delete("/:itemId", verifyUser, deleteCart);

export default router;
