import { User } from "../models/userSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOtpEmail } from "../utils/sendMail.js";
import _ from "lodash";

dotenv.config();

// Utility function for error handling
const handleError = (res, message, error = null, status = 500) => {
  console.error(message, error);
  res
    .status(status)
    .json({ message, error: error ? error.message : undefined });
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    // Basic validation
    if (!username || !firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username or email exists
    const [usernameFound, emailFound] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (usernameFound) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    if (emailFound) {
      return res.status(400).json({ message: "Email is already in use" });
    }

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

    // Generate JWT token for email verification
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send verification email with the token
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendOtpEmail(
      user.email,
      `Please verify your email by clicking on this link: ${verificationLink}`
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    handleError(res, "Failed to register user", error);
  }
};

// Verify user email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: "Email verified successfully" });
    });
  } catch (error) {
    handleError(res, "Failed to verify email", error);
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
      { expiresIn: "1h" }
    );

    // Set user info in session
    req.session.user = {
      id: user._id,
      email: user.email,
    };

    res.json({ message: "Logged in successfully", token });
  } catch (error) {
    handleError(res, "Failed to login user", error);
  }
};

// Verify JWT
export const verifyUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return res.status(403).json({ message: "Invalid token" });

      req.user = decoded;
      next();
    });
  } catch (error) {
    handleError(res, "Failed to verify token", error);
  }
};

// Logout user
export const logOutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return handleError(res, "Failed to log out", err);
    }
    res.json({ message: "Logged out successfully" });
  });
};

// Send OTP and store in session
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const generatedOtp = generateOTP();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.session.otp = generatedOtp;
    await sendOtpEmail(user.email, `Your OTP is: ${generatedOtp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    handleError(res, "Failed to send OTP", error);
  }
};

// Verify OTP
export const otpVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.session.otp;
    console.log(storedOtp);
    console.log(otp);

    if (otp !== storedOtp)
      return res.status(401).json({ message: "Invalid OTP" });

    req.session.otp = null; // Clear OTP after verification
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    handleError(res, "Failed to verify OTP", error);
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (otp !== req.session.otp)
      return res.status(401).json({ message: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.session.otp = null; // Clear OTP after password reset
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    handleError(res, "Failed to reset password", error);
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { email, updatedFields } = req.body;

    // Define restricted fields
    const restrictedFields = [
      "isVerified",
      "role",
      "_id",
      "email",
      "username",
      "isActive",
    ];

    // Filter out restricted fields
    const filteredFields = _.omit(updatedFields, restrictedFields);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.fileLocation) {
      filteredFields.profileImage = req.fileLocation; // Update S3 file location
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: filteredFields },
      { new: true }
    ).select("-password -role -isActive -createdAt -updatedAt");

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    handleError(res, "Unable to update profile", error);
  }
};

// Show profile
export const showProfile = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id).select(
      "-password -role -isActive -isVerified -createdAt -updatedAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    handleError(res, "Failed to retrieve user profile", error);
  }
};

// Get all users
export const allUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    handleError(res, "Failed to retrieve users", error);
  }
};
