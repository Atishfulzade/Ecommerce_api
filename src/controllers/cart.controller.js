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
    if (!email || !newItem) {
      return res
        .status(400)
        .json({ message: "Email and new item are required" });
    }

    const cartItem = new Cart(newItem);
    await cartItem.save(); // Save the new cart item to the database

    res.status(200).json({ message: "New item added successfully", cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return 500 for server errors
  }
};

export const editCartItem = async (req, res) => {
  try {
    const { itemId, updatedField } = req.body;
    if (!itemId || !updatedField) {
      return res
        .status(400)
        .json({ message: "Item ID and updated field are required" });
    }

    const cartItem = await Cart.findByIdAndUpdate(itemId, updatedField, {
      new: true,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart" });
    }

    res.status(200).json({ message: "Item updated successfully", cartItem });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return 500 for server errors
  }
};

export const deleteCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const cartItem = await Cart.findByIdAndDelete(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return 500 for server errors
  }
};
