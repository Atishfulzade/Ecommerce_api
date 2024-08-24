import express from "express";
import {
  createProduct,
  filterProduct,
  findById,
  getAllProducts,
} from "../controllers/product.controller.js";
const router = express.Router();

// Get all products
router.get("/", getAllProducts);

// Create a new product
router.post("/", createProduct);

// Filter products by category
router.get("/filter", filterProduct);

// Get a product by ID
router.get("/:id", findById);

export default router;
