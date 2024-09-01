import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authorizeRoles } from "../utils/AuthoriseRole.js";

const router = express.Router();

// Route to get all categories
router.get("/", getAllCategories);

// Route to get a category by ID
router.get("/:id", getCategoryById);

// Route to create a new category
router.post("/", authorizeRoles("admin"), createCategory);

// Route to update a category
router.put("/:id", authorizeRoles("admin"), updateCategory);

// Route to delete a category
router.delete("/:id", authorizeRoles("admin"), deleteCategory);

export default router;
