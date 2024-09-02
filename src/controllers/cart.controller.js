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
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({ message: "User ID, product ID, and quantity are required" });
    }

    // Find the user's cart
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      // If the cart doesn't exist, create a new one
      userCart = new Cart({ userId, products: [{ productId, quantity }] });
    } else {
      // Check if the product already exists in the cart
      const productIndex = userCart.products.findIndex(
        (product) => product.productId.toString() === productId
      );

      if (productIndex > -1) {
        // If the product exists, update the quantity
        userCart.products[productIndex].quantity += quantity;
      } else {
        // If the product doesn't exist, add it to the products array
        userCart.products.push({ productId, quantity });
      }
    }

    // Save the updated cart to the database
    await userCart.save();

    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart: userCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the quantity or other fields of a product in the cart
export const editCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
      return res
        .status(400)
        .json({
          message: "User ID, product ID, and new quantity are required",
        });
    }

    // Find the user's cart
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex > -1) {
      // Update the product's quantity
      userCart.products[productIndex].quantity = quantity;

      // Save the updated cart to the database
      await userCart.save();

      res
        .status(200)
        .json({ message: "Cart item updated successfully", cart: userCart });
    } else {
      res.status(404).json({ message: "Product not found in the cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product from the cart
export const deleteCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "User ID and product ID are required" });
    }

    // Find the user's cart
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex > -1) {
      // Remove the product from the cart
      userCart.products.splice(productIndex, 1);

      // Save the updated cart to the database
      await userCart.save();

      res
        .status(200)
        .json({
          message: "Product removed from cart successfully",
          cart: userCart,
        });
    } else {
      res.status(404).json({ message: "Product not found in the cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
