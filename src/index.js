import express from "express";
import "dotenv/config";
import cors from "cors";
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import supplierAuth from "./routes/supplierAuth.js";
import cookieParser from "cookie-parser";
import { connect } from "./db/conn.js";
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/products", productRoute);
app.use("/api/v1/user/auth", authRoute);
app.use("/api/v1/supplier/auth", supplierAuth);
connect();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
