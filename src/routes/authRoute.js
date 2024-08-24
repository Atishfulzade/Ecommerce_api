import express from "express";
import {
  loginUser,
  logOutUser,
  otpVerify,
  registerUser,
  sendOtp,
} from "../controllers/user.controller.js";
const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", loginUser);

// POST /api/v1/auth/register
router.post("/register", registerUser);

// POST /api/v1/auth/logout
router.post("/logout", logOutUser);

// POST /api/v1/auth/reset-password
router.post("/reset-password", (req, res) => {
  // Add logic to reset the user's password
  res.send("Password reset request received");
});
router.get("/otp", sendOtp);
router.post("/otp", otpVerify);
router.put("/profile", (req, res) => {
  // Add logic to reset the user's password
  res.send("profile updated");
});

export default router;
