import { User } from "../models/userSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOtpEmail } from "../utils/sendMail.js";
import _ from "lodash";
import mongoose from "mongoose";

dotenv.config();

// Utility function for error handling
const handleError = (res, message, error = null, status = 500) => {
  console.error(message, error);
  res
    .status(status)
    .json({ message, error: error ? error.message : undefined });
};

// ========================== Reset Password ==========================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP matches
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    handleError(res, "Failed to reset password", error);
  }
};

// ========================== Send OTP ==========================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP(); // Function to generate OTP
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Save OTP and its expiry time in the user record
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(user.email, `Your OTP for password reset is: ${otp}`);

    res.status(200).json({ message: "OTP sent to email successfully" });
  } catch (error) {
    handleError(res, "Failed to send OTP", error);
  }
};

// ========================== Verify OTP ==========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid, so clear it and allow further action
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token for the user (if applicable)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      token, // Optional: Send token if it's part of the flow
    });
  } catch (error) {
    handleError(res, "Failed to verify OTP", error);
  }
};

// ========================== Register New User ==========================
export const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailFound = await User.findOne({ email });
    if (emailFound) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await sendOtpEmail(
      user.email,
      `Please verify your email by clicking on this link: ${verificationLink}`
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      token,
      user,
    });
  } catch (error) {
    handleError(res, "Failed to register user", error);
  }
};

// ========================== Authentication Middleware ==========================
export const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return res.status(403).json({ message: "Invalid token" });
      req.user = decoded;
      next();
    });
  } catch (error) {
    handleError(res, "Failed to verify token", error);
  }
};

// ========================== Login User ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include the password for comparison
    const user = await User.findOne({ email }).select(
      " -updatedAt -cards -address"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Exclude password from user object before sending the response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    handleError(res, "Failed to login user", error);
  }
};

// ========================== Logout User ==========================
export const logOutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err)
      return res.status(500).json({ message: "Failed to log out", error: err });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// =========================== Address Controllers ===========================
export const addOrUpdateAddress = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { address } = req.body;
    console.log("Address");

    if (!address)
      return res.status(400).json({ message: "Address is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update or add address
    user.address = address;
    await user.save();

    res.status(200).json({ message: "Address updated successfully", user });
  } catch (error) {
    handleError(res, "Failed to update address", error);
  }
};

// ============================ Card Controllers ============================
export const addCard = async (req, res) => {
  try {
    const { cardNumber, cardholderName, expiryDate, cvv, userId } = req.body;
    console.log("adding", req.body);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCard = {
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      userId, // Attach the userId to the card
    };

    // Push the card into the user's card array
    user.cards.push(newCard);
    await user.save(); // Save the user with the updated card list

    res.status(201).json({ message: "Card added successfully", card: newCard });
  } catch (error) {
    handleError(res, "Failed to add card", error);
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const { id: userId } = req.user;

    if (!cardId)
      return res.status(400).json({ message: "Card ID is required" });

    // Find the user and remove the card
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cards = user.cards.filter((card) => card._id.toString() !== cardId);
    await user.save();

    res.status(200).json({ message: "Card removed successfully" });
  } catch (error) {
    handleError(res, "Failed to delete card", error);
  }
};

// ============================ Show Profile ============================
export const showProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    handleError(res, "Failed to fetch user profile", error);
  }
};

// ============================ Update Profile ============================
export const updateProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const profileImage = req.uploadedFileUrl;
    console.log(profileImage);

    if (!profileImage) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    handleError(res, "Failed to update profile", error);
  }
};

// ============================ Retrieve All Users (Admin Only) ============================
export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    handleError(res, "Failed to fetch users", error);
  }
};
