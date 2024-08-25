import express from "express";
import {
  loginSupplier,
  registerSupplier,
  verifySupplier,
  showProfile,
  updateProfile,
  deleteSupplier,
  getAllSuppliers,
} from "../controllers/supplier.controller.js";

const router = express.Router();

// Supplier login route
router.post("/login", loginSupplier);

// Supplier registration route
router.post("/register", registerSupplier);

// Get supplier details by ID
router.get("/profile/:id", verifySupplier, showProfile);

// Update supplier details by ID
router.put("/profile/:id", verifySupplier, updateProfile);

// Delete supplier by ID
router.delete("/profile/:id", verifySupplier, deleteSupplier);

// Get all suppliers route
router.get("/all", getAllSuppliers);

export default router;
