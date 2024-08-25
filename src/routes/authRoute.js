import express from "express";
import {
  loginUser,
  logOutUser,
  otpVerify,
  registerUser,
  resetPassword,
  sendOtp,
  updateProfile,
  verifyUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", loginUser);

// POST /api/v1/auth/register
router.post("/register", registerUser);

// POST /api/v1/auth/logout
router.post("/logout", logOutUser);

// POST /api/v1/auth/send-otp (Step 1: Send OTP for password reset)
router.post("/send-otp", sendOtp);

// POST /api/v1/auth/reset-password (Step 2: Verify OTP and reset password)
router.post("/reset-password", resetPassword);

// GET /api/v1/auth/otp (Separate route to send OTP via GET request, if needed)
router.get("/otp", sendOtp);

// POST /api/v1/auth/otp (Verify the OTP sent)
router.post("/otp", otpVerify);

// PUT /api/v1/auth/profile (Update profile route)
router.put("/profile", verifyUser, updateProfile);

export default router;
