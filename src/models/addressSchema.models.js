import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    minlength: 3,
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
  },
  zipCode: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/, // Example for 10-digit numbers
  },
});

export { addressSchema };
