import { Category } from "../models/categorySchema.models.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

// Get a category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params; // Use params for ID in URL

  // Validate ID format
  if (!id || id.length !== 24) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Failed to fetch category:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch category", error: error.message });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const { name } = req.body;
  const imageURL = req.uploadedFileKey;

  // Validate input
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Category name is required and must be a string" });
  }

  try {
    const newCategory = new Category({ name, imageURL });
    await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    res
      .status(500)
      .json({ message: "Failed to create category", error: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Validate ID format
  if (!id || id.length !== 24) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }

  // Validate input
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Category name is required and must be a string" });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // Ensure schema validation
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    res
      .status(500)
      .json({ message: "Failed to update category", error: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!id || id.length !== 24) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Failed to delete category:", error);
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};
