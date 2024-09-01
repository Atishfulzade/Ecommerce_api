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
import { uploadImageToS3 } from "../utils/s3_configuration.js";
import { authorizeRoles } from "../utils/AuthoriseRole.js";

const router = express.Router();

// Supplier login route
router.post("/login", loginSupplier);

// Supplier registration route
router.post("/register", registerSupplier);

// Get supplier details by ID
router.get(
  "/profile/:id",
  verifySupplier,
  authorizeRoles("user", "admin", "supplier"),
  showProfile
);

// Update supplier details by ID
router.put(
  "/profile/:id",
  verifySupplier,
  authorizeRoles("admin", "supplier"),
  uploadImageToS3,
  updateProfile
);

// Delete supplier by ID
router.delete(
  "/profile/:id",
  verifySupplier,
  authorizeRoles("admin"),
  deleteSupplier
);

// Get all suppliers route
router.get("/all", verifySupplier, authorizeRoles("admin"), getAllSuppliers);

export default router;
