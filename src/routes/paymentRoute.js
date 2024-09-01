// routes/paymentRoutes.js
import express from "express";
import {
  processPayment,
  getPaymentStatus,
  getPaymentHistory,
  initiateRefund,
  getPaymentMethods,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/payment", processPayment);
router.get("/payment/status/:transactionId", getPaymentStatus);
router.get("/payment/history/:userId", getPaymentHistory);
router.post("/payment/refund/:transactionId", initiateRefund);
router.get("/payment/methods", getPaymentMethods);

export default router;
