import express from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", loginUser);

// POST /api/v1/auth/register
router.post("/register", registerUser);

// GET /api/v1/auth/verify
router.get("/verify", (req, res) => {
  // Add logic to verify the user's identity, like email or token verification
  res.send("User verified");
});

// POST /api/v1/auth/logout
router.post("/logout", (req, res) => {
  // Add logic to log out the user
  res.send("User logged out successfully");
});

// POST /api/v1/auth/reset-password
router.post("/reset-password", (req, res) => {
  // Add logic to reset the user's password
  res.send("Password reset request received");
});
router.post("/otp/:otp", (req, res) => {
  const otp = req.params.otp;
  // Add logic to reset the user's password
  res.send("OTP  request received");
});
router.put("/profile", (req, res) => {
  // Add logic to reset the user's password
  res.send("OTP  request received");
});

export default router;
