import express from "express";
import "dotenv/config";
import cors from "cors";
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import supplierAuth from "./routes/supplierAuth.js";
import paymentRoute from "./routes/paymentRoute.js";
const app = express();

app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/products", productRoute);
app.use("/api/v1/user/auth", authRoute);
app.use("/api/v1/supplier/auth", supplierAuth);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
