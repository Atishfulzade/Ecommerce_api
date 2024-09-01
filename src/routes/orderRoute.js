import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

// POST /api/v1/orders
router.post("/", createOrder);

// GET /api/v1/orders
router.get("/", getAllOrders);

// GET /api/v1/orders/:id
router.get("/:id", getOrderById);

// PUT /api/v1/orders/:id
router.put("/:id", updateOrder);

// DELETE /api/v1/orders/:id
router.delete("/:id", deleteOrder);

export default router;
