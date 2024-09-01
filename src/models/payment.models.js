import mongoose from "mongoose";

// Define the Payment schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"], // Enum for payment status
    default: "Pending",
  },
  transactionId: {
    type: String,
    unique: true, // Ensure each transaction ID is unique
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer"], // Enum for payment methods
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the last updated date
  },
});

// Update the updatedAt field before saving
paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Payment model
const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };
