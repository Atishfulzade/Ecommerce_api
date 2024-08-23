import express from "express";
const router = express.Router();

// Mock data (for demonstration purposes)
let cart = [];

// GET - Fetch all items in the cart
router.get("/cart", (req, res) => {
  res.json({ cart });
});

// POST - Add a new item to the cart
router.post("/cart", (req, res) => {
  const newItem = req.body; // Assuming item details come in the body
  cart.push(newItem);
  res.status(201).json({ message: "Item added to the cart", cart });
});

// PUT - Update a specific item in the cart
router.put("/cart/:id", (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  cart = cart.map((item) => (item.id === id ? updatedItem : item));
  res.json({ message: "Item updated", cart });
});

// DELETE - Remove a specific item from the cart
router.delete("/cart/:id", (req, res) => {
  const { id } = req.params;
  cart = cart.filter((item) => item.id !== id);
  res.json({ message: "Item removed", cart });
});

export default router;
