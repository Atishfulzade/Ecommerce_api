import { Supplier } from "../models/supplierSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOtpEmail } from "../utils/sendMail.js";

dotenv.config();

// Helper function to generate JWT token
const generateToken = (supplier, expiresIn = "1h") => {
  return jwt.sign(
    {
      id: supplier._id,
      companyName: supplier.companyName,
      role: supplier.role,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Register new Supplier
export const registerSupplier = async (req, res) => {
  try {
    const { companyName, contactPerson, email, mobile, password, vatNumber } =
      req.body;
    const { firstname, lastname } = contactPerson;

    if (!vatNumber) {
      return res.status(400).json({ message: "VAT number is required" });
    }

    const [companyNameFound, emailFound, vatNumberFound] = await Promise.all([
      Supplier.findOne({ companyName }),
      Supplier.findOne({ email }),
      Supplier.findOne({ vatNumber }),
    ]);

    if (companyNameFound)
      return res.status(400).json({ message: "Company name is already taken" });
    if (emailFound)
      return res.status(400).json({ message: "Email is already in use" });
    if (vatNumberFound)
      return res.status(400).json({ message: "VAT number is already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const supplier = new Supplier({
      companyName,
      contactPerson: { firstname, lastname },
      email,
      password: hashedPassword,
      vatNumber,
      mobile,
    });

    await supplier.save();

    const token = generateToken(supplier);

    res.status(201).json({
      message: "Supplier registered successfully",
      token,
      supplier,
    });
  } catch (error) {
    console.error("Error during supplier registration:", error);
    res
      .status(500)
      .json({ message: "Failed to register supplier", error: error.message });
  }
};

// Login Supplier
export const loginSupplier = async (req, res) => {
  try {
    const { email, password } = req.body;

    const supplier = await Supplier.findOne({ email });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(supplier);

    res.json({ message: "Logged in successfully", token, supplier });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to login supplier", error: error.message });
  }
};

// Verify JWT
export const verifySupplier = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplier = await Supplier.findById(decoded.id);

    if (!supplier)
      return res.status(401).json({ message: "Supplier not found" });

    req.user = supplier; // Attach user to req object
    next();
  } catch (err) {
    console.error("Error with authentication middleware:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Logout Supplier
export const logOutSupplier = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res
        .status(500)
        .json({ message: "Failed to log out", error: err.message });
    }
    res.json({ message: "Logged out successfully" });
  });
};

// Send OTP and store in session
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const generatedOtp = generateOTP();

    const supplier = await Supplier.findOne({ email });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    req.session.otp = generatedOtp;
    await sendOtpEmail(supplier.email, `Your OTP is: ${generatedOtp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP
export const otpVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.session.otp;

    if (otp !== storedOtp)
      return res.status(401).json({ message: "Invalid OTP" });

    req.session.otp = null; // Clear OTP after verification
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    const supplier = await Supplier.findOne({ email });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    if (otp !== req.session.otp)
      return res.status(401).json({ message: "Invalid OTP" });

    supplier.password = await bcrypt.hash(newPassword, 10);
    await supplier.save();

    req.session.otp = null; // Clear OTP after password reset
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { email, updatedFields } = req.body;

    // Fetch the supplier by email
    const supplier = await Supplier.findOne({ email });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    // If S3 image upload was successful, attach the new image URL
    if (req.fileLocation) {
      updatedFields.profileImage = req.fileLocation; // Use the S3 URL or path
    }

    // Update the supplier document with the new fields
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplier._id,
      { $set: updatedFields },
      { new: true, runValidators: true } // Ensures validation is run
    );

    // Respond with the updated supplier information
    res.status(200).json({
      message: "Profile updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    // Handle errors, such as DB connection or validation issues
    res.status(500).json({
      message: "Unable to update profile",
      error: error.message,
    });
  }
};

// Show profile
export const showProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id).select("-password");
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({ supplier });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve supplier profile",
      error: error.message,
    });
  }
};

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).select("-password -updatedAt");
    res.status(200).json(suppliers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve suppliers", error: error.message });
  }
};

// Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete supplier", error: error.message });
  }
};
