import { Order } from "../models/orderSchema.models.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount } = req.body;

    // Validate input fields
    if (
      !userId ||
      !Array.isArray(products) ||
      products.length === 0 ||
      typeof totalAmount !== "number"
    ) {
      return res
        .status(400)
        .json({
          message:
            "User ID, products array, and totalAmount (number) are required",
        });
    }

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Failed to create order:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

// Get all orders with pagination
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId")
      .populate("products.productId");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get an order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate("userId")
      .populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

// Update an order
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order:", error);
    res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Failed to delete order:", error);
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};
