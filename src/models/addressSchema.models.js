import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  street: {
    type: String,
    required: true,
    minlength: 3,
  },
  landmark: {
    type: String,
    minlength: 2,
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
  pin: {
    type: String,
    required: true,
  },

  contact: {
    type: String,
    required: true,
    match: /^\d{10}$/, // Example for 10-digit numbers
  },
});

export { addressSchema };
