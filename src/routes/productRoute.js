import express from "express";
import {
  createProduct,
  deleteProduct,
  filterProduct,
  findById,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyUser } from "../controllers/user.controller.js";
const router = express.Router();

// Get all products
router.get("/", getAllProducts);

// Create a new product
router.post("/", verifyUser, createProduct);

// Filter products by category
router.put("/:id", verifyUser, updateProduct);
router.delete("/:id", verifyUser, deleteProduct);

router.get("/filter", filterProduct);

// Get a product by ID
router.get("/:id", findById);

export default router;
