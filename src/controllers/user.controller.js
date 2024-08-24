import { User } from "../models/userSchema.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

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
export const verifyUser = (req, res) => {
  try {
  } catch (error) {
    throw new Error(error.message, "user not authenticated");
  }
};
