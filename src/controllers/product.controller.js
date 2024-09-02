import { Product } from "../models/productSchema.models.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select(
      "_id name category_name min_catalog_price min_product_price description mall_verified product_images"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, product_images } = req.body;

    // Check for required fields
    if (!name || !description || !product_images || !product_images.length) {
      return res.status(400).json({
        message:
          "Name, description, and at least one product image are required fields.",
      });
    }

    // Get the file locations from the previous middleware
    const productImages = req.body.fileLocations || [];

    // Create a new product object
    const newProduct = new Product({
      name,
      description,
      product_images: productImages, // Store the array of signed URLs of uploaded images
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
