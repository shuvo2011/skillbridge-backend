import { Request, Response } from "express";
import { tutorCategoryService } from "./tutorCategory.service";

const getMyCategories = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;

		const data = await tutorCategoryService.getMyCategories(userId);

		res.status(200).json({ success: true, data });
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const addCategory = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { categoryId } = req.body;

		if (!categoryId) {
			res.status(400).json({
				success: false,
				message: "categoryId is required",
			});
			return;
		}

		const data = await tutorCategoryService.addCategory(userId, categoryId);

		res.status(201).json({
			success: true,
			message: "Category added successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : error.message.includes("already added") ? 409 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const removeCategory = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		await tutorCategoryService.removeCategory(userId, id as string);

		res.status(200).json({
			success: true,
			message: "Category removed successfully",
		});
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

export const tutorCategoryController = {
	getMyCategories,
	addCategory,
	removeCategory,
};
