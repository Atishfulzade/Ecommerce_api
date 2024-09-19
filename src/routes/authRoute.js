import express from "express";
import {
  loginUser,
  registerUser,
  logOutUser,
  resetPassword,
  sendOtp,
  verifyOtp,
  showProfile,
  updateProfile,
  addOrUpdateAddress, // Using this combined controller for add/update address
  addCard,
  verifyUser,
  allUsers,
  deleteCard, // Ensure this controller is properly defined in the controller file
} from "../controllers/user.controller.js";
import { uploadImageToS3 } from "../utils/s3_configuration.js";
import { authorizeRoles } from "../utils/AuthoriseRole.js";

const router = express.Router();

// ========================== Auth Routes ==========================
router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.post("/auth/logout", logOutUser);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/otp", verifyOtp);
router.get("/auth/send-otp", verifyUser, sendOtp);

// ======================== Profile Routes =========================
router.get("/profile", verifyUser, showProfile);
router.put(
  "/profile",
  verifyUser, // Verify user is authenticated
  uploadImageToS3, // Middleware to upload image to S3
  updateProfile // Controller to update profile info
);

// ====================== Address and Card Routes ==================
router.put("/address", verifyUser, addOrUpdateAddress); // Single route for add/update
router.post("/card", verifyUser, addCard); // POST for adding new card
router.delete("/card", verifyUser, deleteCard); // delete card

// ========================= Admin Routes ==========================
router.get("/", authorizeRoles("admin"), allUsers); // Route to retrieve all users for admin

export default router;
