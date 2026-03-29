import { Request, Response } from "express";
import { categoryService } from "./category.service";
import { paginationHelper } from "../../helpers/paginationHelper"

const getAllCategories = async (req: Request, res: Response) => {
	// Extract search term if provided
	const search = typeof req.query.search === "string" ? req.query.search : undefined;

	// Extract tags if provided (can be passed as comma-separated list)
	const tags =
		typeof req.query.tags === "string"
			? req.query.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
			: undefined;

	// Check if featured filter is provided (true/false)
	const featured = typeof req.query.featured === "string" ? req.query.featured === "true" : undefined;

	// Get pagination and sorting data from the helper function
	const q = paginationHelper(req); // ✅ pagination + sorting

	// Build the payload for fetching categories from the database
	const payload: any = { ...q };
	if (search) payload.search = search;
	if (tags?.length) payload.tags = tags;
	if (featured !== undefined) payload.featured = featured;

	try {
		// Call the category service to get categories based on the payload
		const result = await categoryService.getAllCategories(payload);

		// Return the result with pagination metadata
		res.status(200).json(result);
	} catch (error) {
		// Handle errors and send error response
		console.error("Error retrieving categories:", error);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const getCategoryById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const category = await categoryService.getCategoryById(id as string);

		if (!category) {
			return res.status(404).json({
				error: "Category not found",
			});
		}

		res.status(200).json(category);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Failed to retrieve category",
			details: error,
		});
	}
};
const createCategory = async (req: Request, res: Response) => {
	try {
		console.log("Request body:", req.body); // ← এটা add করো

		const { name, status } = req.body;

		if (!name) {
			return res.status(400).json({
				error: "Category name is required",
			});
		}

		const result = await categoryService.createCategory({ name, status });
		res.status(201).json(result);
	} catch (error: any) {
		console.log("Error:", error.message); // ← এটা add করো
		res.status(error.statusCode || 500).json({
			error: error.message || "Category creation failed",
		});
	}
};
const updateCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, status } = req.body;

		if (!name) {
			return res.status(400).json({
				error: "Category name is required",
			});
		}

		const updatedCategory = await categoryService.updateCategory(id as string, { name, status });

		if (!updatedCategory) {
			return res.status(404).json({
				error: "Category not found",
			});
		}

		res.status(200).json(updatedCategory);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Category update failed",
			details: error,
		});
	}
};

// Delete Category
const deleteCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const deletedCategory = await categoryService.deleteCategory(id as string);

		if (!deletedCategory) {
			return res.status(404).json({
				error: "Category not found",
			});
		}

		res.status(200).json({ message: "Category deleted successfully" });
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Category deletion failed",
			details: error,
		});
	}
};
export const categoryController = {
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	deleteCategory
};
