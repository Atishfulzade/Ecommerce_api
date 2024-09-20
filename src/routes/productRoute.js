import express from "express";
import {
  createProduct,
  deleteProduct,
  filterProduct,
  findById,
  getAllProducts,
  getProductsBySupplierId,
  searchProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifySupplier } from "../controllers/supplier.controller.js";
import { uploadImagesToS3 } from "../utils/s3_configuration.js";
const router = express.Router();

// Get all products
router.get("/", getAllProducts);
router.post("/search", searchProduct);

// Create a new product
router.post(
  "/",
  verifySupplier,

  uploadImagesToS3,

  createProduct
);
// router.get("/product/:supplierId", verifySupplier, getProductsBySupplierId);
router.get("/product", verifySupplier, getProductsBySupplierId);

// Filter products by category
router.put("/:id", verifySupplier, updateProduct);
router.delete("/:id", verifySupplier, deleteProduct);

router.get("/filter", filterProduct);

// Get a product by ID
router.get("/:id", findById);

export default router;
