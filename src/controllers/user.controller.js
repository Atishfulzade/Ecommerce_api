import { User } from "../models/userSchema.models.js";
import { Supplier } from "../models/supplierSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOtpEmail } from "../utils/sendMail.js";

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
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    console.log(otpExpiry);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(user.email, `Your OTP for password reset is: ${otp}`);

    return res.status(200).json({ message: "OTP sent to email successfully" });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    handleError(res, "Failed to verify OTP", error);
  }
};

// ========================== Register New User ==========================
export const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender, dateOfBirth } =
      req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !gender ||
      !dateOfBirth
    ) {
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

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
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
  if (req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  }

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

    const user = await User.findOne({ email }).select(
      "-updatedAt -cards -address"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user._id; // Create session

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: user.toObject({
        versionKey: false,
        transform: (_, ret) => {
          delete ret.password;
          return ret;
        },
      }),
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

// ============================ Show Profile ============================
export const showProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await User.findById(userId).select("-password");
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
    const profileImage = req.uploadedFileKey;

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

// ============================ Address Controllers ============================
export const addOrUpdateAddress = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { address } = req.body;

    if (!address)
      return res.status(400).json({ message: "Address is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = address; // Update or add address
    await user.save();

    res.status(200).json({ message: "Address updated successfully", user });
  } catch (error) {
    handleError(res, "Failed to update address", error);
  }
};
//========================== delete user account ====================================
export const deleteUserAccount = async (req, res) => {
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    return res
      .status(200)
      .json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Unable to delete user account" });
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
// ============================ Card Controllers ============================
export const addCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, cardholderName, userId } = req.body;

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.cards.push({ cardNumber, cardholderName, expiryDate, cvv, userId });
    await user.save();
    res
      .status(201)
      .json({ message: "Card added successfully", cards: user.cards });
  } catch (error) {
    console.error("Failed to add card:", error);
    res.status(500).json({ message: "Internal server error" });
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

    res.status(200).json({ message: "Card removed successfully", user });
  } catch (error) {
    handleError(res, "Failed to delete card", error);
  }
};
// Validate User Token

export const validateUser = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check both User and Supplier collections for the decoded ID
    const user = await User.findById(decoded.id).select("-password");
    const supplier = await Supplier.findById(decoded.id).select("-password");

    if (!user && !supplier) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the appropriate data
    if (supplier) {
      return res.status(200).json({ supplier });
    }
    return res.status(200).json({ user });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    console.error("Error validating token:", error); // Log unexpected errors
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ========================== Verify link ==========================
export const verificationLink = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's verification status
    user.isVerified = true;
    await user.save(); // Save the changes in the database

    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Verification error:", error);
    return res
      .status(500)
      .json({ message: "Verification failed!", error: error.message });
  }
};
