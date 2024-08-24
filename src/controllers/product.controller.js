import { Product } from "../models/productSchema.models.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check for required fields
    if (!name || !description) {
      return res.status(400).json({
        error: "Name and description are required fields.",
      });
    }

    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Failed to create product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};
export const filterProduct = async (req, res) => {
  try {
    const { minPrice, maxPrice, category } = req.query; // Use req.query to get query parameters
    const filterConditions = {};

    // Only add filters if the query params are provided
    if (minPrice) filterConditions.min_product_price = { $gte: minPrice };
    if (maxPrice)
      filterConditions.min_product_price = {
        ...filterConditions.min_product_price,
        $lte: maxPrice,
      };
    if (category) filterConditions.category_name = category;

    const products = await Product.find(filterConditions);

    res.status(200).json(products);
  } catch (error) {
    console.log("Unable to filter products", error);
    res.status(500).json({ message: error.message });
  }
};
export const findById = async (req, res) => {
  try {
    const { id } = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Failed to find product:", error);
    res.status(500).json({ error: "Failed to find product" });
  }
};
