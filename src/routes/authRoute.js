import express from "express";
import {
  allUsers,
  loginUser,
  logOutUser,
  otpVerify,
  registerUser,
  resetPassword,
  sendOtp,
  showProfile,
  updateProfile,
  verifyUser,
} from "../controllers/user.controller.js";
import { uploadImageToS3 } from "../utils/s3_configuration.js";
import { authorizeRoles } from "../utils/AuthoriseRole.js";

const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", loginUser);

// POST /api/v1/auth/register
router.post("/register", registerUser);

// POST /api/v1/auth/logout
router.post("/logout", logOutUser);

// GET /api/v1/auth/send-otp
router.get("/send-otp", verifyUser, sendOtp);

// POST /api/v1/auth/reset-password
router.post("/reset-password", resetPassword);

// POST /api/v1/auth/otp
router.post("/otp", otpVerify);

// GET /api/v1/auth/profile
router.get("/profile", verifyUser, showProfile);

router.get("/", authorizeRoles("admin"), allUsers);
// PUT /api/v1/auth/profile
router.put(
  "/profile",
  verifyUser,
  (req, res, next) => {
    if (req.file) {
      uploadImageToS3(req, res, next);
    } else {
      next();
    }
  },
  updateProfile
);

export default router;
