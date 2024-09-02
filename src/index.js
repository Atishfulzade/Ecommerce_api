import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Import routes
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import supplierAuth from "./routes/supplierAuth.js";
import paymentRoute from "./routes/paymentRoute.js";
import orderRoute from "./routes/orderRoute.js";
import cartRoute from "./routes/cartRoute.js";

// Import DB connection
import { connect } from "./db/conn.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

app.disable("x-powered-by");

// Session Configuration
const sessionSecret = process.env.SESSION_SECRET || "default_secret";
const mongoUri = process.env.MONGODB_URI;

if (!sessionSecret) {
  console.error("SESSION_SECRET is not set");
}

if (!mongoUri) {
  console.error("MONGODB_URI is not set");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: { secure: process.env.NODE_ENV === "production" }, // Adjust based on environment
  })
);

// Serve Static Files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route Middleware
app.use("/api/v1/products", productRoute);
app.use("/api/v1/user", authRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/supplier", supplierAuth);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/v1/order", orderRoute);

// Connect to MongoDB
connect().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
