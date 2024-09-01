import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authorizeRoles } from "../utils/AuthoriseRole.js";
import { verifySupplier } from "../controllers/supplier.controller.js";

const router = express.Router();

// Route to get all categories
router.get("/", getAllCategories);

// Route to get a category by ID
router.get("/:id", getCategoryById);

// Route to create a new category
router.post("/", verifySupplier, authorizeRoles("admin"), createCategory);

// Route to update a category
router.put("/:id", verifySupplier, authorizeRoles("admin"), updateCategory);

// Route to delete a category
router.delete("/:id", verifySupplier, authorizeRoles("admin"), deleteCategory);

export default router;
