import express from "express";
import { verifyUser } from "../controllers/user.controller.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

// POST /api/v1/orders
router.post("/", verifyUser, createOrder);

// GET /api/v1/orders
router.get("/", verifyUser, getAllOrders);

// GET /api/v1/orders/:id
router.get("/:id", verifyUser, getOrderById);

// PUT /api/v1/orders/:id
router.put("/:id", verifyUser, updateOrder);

// DELETE /api/v1/orders/:id
router.delete("/:id", verifyUser, deleteOrder);

export default router;
