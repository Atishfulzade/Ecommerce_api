import { Product } from "../models/productSchema.models.js";
import mongoose from "mongoose";
// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select(
      "-description -full_details -supplier -trend -popular -has_mrp -is_added_to_wishlist -shipping -available_stock"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductsBySupplierId = async (req, res) => {
  const { supplierId } = req.query; // Assuming supplierId is sent as a query parameter

  if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    const products = await Product.find({ supplier: supplierId }).select(
      "-description -full_details -supplier -trend -popular -has_mrp -is_added_to_wishlist -shipping -available_stock"
    ); // Assuming 'supplier' is the field in Product model

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this supplier" });
    }

    res.status(200).json({ products }); // Return products if found
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchProduct = async (req, res) => {
  const { search } = req.body;
  console.log(req);

  try {
    // Validate the search input
    if (!search) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for products with a case-insensitive regex
    const products = await Product.find({
      name: { $regex: search, $options: "i" }, // Case-insensitive search
    });

    // Send the list of products as a JSON response
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  const product_images = req.uploadedFilesKeys;

  try {
    const { name, description } = req.body;
    console.log(req.body);

    // Check for required fields
    if (!name || !description || !product_images) {
      return res.status(400).json({
        message:
          "Name, description, and at least one product image are required fields.",
      });
    }

    // Get the file locations from the previous middleware

    // Create a new product object
    const newProduct = new Product({
      name,
      description,
      product_images: product_images, // Store the array of signed URLs of uploaded images
      ...req.body, // Include any additional fields
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Send the response
    res
      .status(201)
      .json({ message: "Product created successfully", product: savedProduct });
  } catch (error) {
    console.error("Failed to create product:", error);
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// Filter products by price and category
export const filterProduct = async (req, res) => {
  try {
    const { minPrice, maxPrice, category } = req.query;
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
    console.error("Unable to filter products:", error);
    res
      .status(500)
      .json({ message: "Unable to filter products", error: error.message });
  }
};

// Find product by ID
export const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Failed to find product:", error);
    res
      .status(500)
      .json({ message: "Failed to find product", error: error.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, updatedFields);

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Couldn't update product:", error);
    res
      .status(500)
      .json({ message: "Couldn't update product", error: error.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Product.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};
