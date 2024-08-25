import { User } from "../models/userSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendMail.js";

dotenv.config();

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    // Check if username exists
    const usernameFound = await User.findOne({ username });
    if (usernameFound)
      return res.status(400).json({ message: "Username is already taken" });

    // Check if email exists
    const emailFound = await User.findOne({ email });
    if (emailFound)
      return res.status(400).json({ message: "Email is already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await user.save();

    // Success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Success response
    res.json({ message: "Logged in successfully", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to login user", error: error.message });
  }
};
export const verifyUser = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(403).json({ message: "Token is not valid" });
      }

      // Attach user info to request
      req.user = decoded;
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify token", error: error.message });
  }
};

export const logOutUser = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// Send OTP and store it in session/database
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body; // Make sure to get the email from the request body
    const generatedOtp = generateOTP();

    // Store OTP in session
    req.session.otp = generatedOtp;

    // Send OTP to the user's email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendOtpEmail(user.email, generatedOtp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

export const otpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body; // Make sure to get both email and OTP from the request body

    // Retrieve the stored OTP from session or database
    const storedOtp = req.session.otp; // If using session
    // Or retrieve from the database:
    // const user = await User.findOne({ email }).select('otp');
    // const storedOtp = user.otp;

    // Compare the provided OTP with the stored one
    if (otp == storedOtp) {
      res.status(200).json({ message: "OTP verified successfully" });

      // Optionally, clear the OTP from session or database after successful verification
      req.session.otp = null;
      // Or clear OTP in the database:
      // await User.updateOne({ email }, { otp: null });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    const storedOTP = req.session.otp;
    if (storedOTP !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP verified successfully, reset the password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clear the OTP from the session
    req.session.otp = null;

    // Respond with success
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, updatedFields } = req.body; // Extracting email and updated fields from the request body

    // Find the user by their email
    const user = await User.findOne({ email });

    // If the user doesn't exist, return a 404 response
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update the user's profile with the provided fields
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, // Find user by ID
      { $set: updatedFields }, // Set the fields to update
      { new: true } // Return the updated document
    );

    // Send a success response with the updated user
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update profile information",
      error: error.message,
    });
  }
};
