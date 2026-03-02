import { Request, Response } from "express";
import { categoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
	try {
		const { name, status } = req.body;

		if (!name) {
			return res.status(400).json({
				error: "Category name is required",
			});
		}

		const result = await categoryService.createCategory({ name, status });

		res.status(201).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Category creation failed",
			details: error,
		});
	}
};

export const categoryController = {
	createCategory,
};
