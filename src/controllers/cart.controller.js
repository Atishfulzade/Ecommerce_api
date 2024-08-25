import { Cart } from "../models/cartSchema.models.js";

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.find(); // Fetch all cart items from the database
    if (cart.length > 0) {
      res.json(cart); // Return the cart items if found
    } else {
      res.status(404).json({ message: "Cart is empty" }); // Return 404 if no cart items are found
    }
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return 500 for server errors
  }
};
export const addToCart = async (req, res) => {
  try {
    const { email, newItem } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    Cart.push(newItem);
    res.status(200).json({ message: "New item added successfully" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
