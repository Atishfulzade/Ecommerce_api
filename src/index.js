import express from "express";
import "dotenv/config";
import cors from "cors";
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import supplierAuth from "./routes/supplierAuth.js";
import cookieParser from "cookie-parser";
import { connect } from "./db/conn.js";
import session from "express-session";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store your secret in .env
    resave: false, // Forces the session to be saved back to the session store
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/products", productRoute);
app.use("/api/v1/user", authRoute);
app.use("/api/v1/supplier", supplierAuth);
app.use("/api/v1/category", categoryRoute);

connect();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
