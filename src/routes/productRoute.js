import express from "express";
import {
  createProduct,
  deleteProduct,
  filterProduct,
  findById,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifySupplier } from "../controllers/supplier.controller.js";
const router = express.Router();

// Get all products
router.get("/", getAllProducts);

// Create a new product
router.post("/", verifySupplier, createProduct);

// Filter products by category
router.put("/:id", verifySupplier, updateProduct);
router.delete("/:id", verifySupplier, deleteProduct);

router.get("/filter", filterProduct);

// Get a product by ID
router.get("/:id", findById);

export default router;
