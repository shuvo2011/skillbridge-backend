import { CategoryStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta } from "../../helpers/paginationHelper"
type CreateCategoryPayload = {
	name: string;
	status?: CategoryStatus;
};

const getAllCategories = async (payload: {
	search?: string;
	page: number;
	limit: number;
	skip: number;
	take: number;
	sortBy: string;
	sortOrder: "asc" | "desc";
}) => {
	const s = payload.search?.trim();

	// Set up where conditions for search and other filters
	const where: any = {
		...(s
			? {
				OR: [
					{ name: { contains: s, mode: "insensitive" } },
					{ status: { contains: s, mode: "insensitive" } }, // assuming you also want to search by status
				],
			}
			: {}),
	};

	// Sort configuration - safe check
	const allowedSort = ["createdAt", "updatedAt", "name"];
	const sortBy = allowedSort.includes(payload.sortBy) ? payload.sortBy : "createdAt";

	try {
		// Prisma transaction to get both total count and data
		const [total, data] = await prisma.$transaction([
			prisma.category.count({ where }), // Get the total number of matching categories
			prisma.category.findMany({
				where,
				orderBy: { [sortBy]: payload.sortOrder }, // Sorting by allowed fields
				skip: payload.skip, // Pagination
				take: payload.take, // Pagination
			}),
		]);

		// Return the data and pagination metadata
		return {
			meta: buildPaginationMeta(payload.page, payload.limit, total),
			data,
		};
	} catch (error) {
		console.error("Error retrieving categories:", error);
		throw error;
	}
};

const getCategoryById = async (id: string) => {
	try {
		const category = await prisma.category.findUnique({
			where: { id },
		});

		return category;
	} catch (error) {
		console.error("Error retrieving category by ID:", error);
		throw error;
	}
};

const createCategory = async (payload: CreateCategoryPayload) => {
	try {
		const existing = await prisma.category.findUnique({
			where: { name: payload.name },
		});

		if (existing) {
			throw new Error("Category already exists");
		}

		return await prisma.category.create({
			data: {
				name: payload.name,
				status: payload.status || CategoryStatus.PUBLISHED,
			},
		});
	} catch (error) {
		console.error("Error creating category:", error);
		throw error;
	}
};


const updateCategory = async (id: string, payload: CreateCategoryPayload) => {
	try {
		const existing = await prisma.category.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new Error("Category not found");
		}

		return await prisma.category.update({
			where: { id },
			data: {
				name: payload.name,
				status: payload.status || CategoryStatus.PUBLISHED,
			},
		});
	} catch (error) {
		console.error("Error updating category:", error);
		throw error;
	}
};

const deleteCategory = async (id: string) => {
	try {
		const existing = await prisma.category.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new Error("Category not found");
		}

		return await prisma.category.delete({
			where: { id },
		});
	} catch (error) {
		console.error("Error deleting category:", error);
		throw error;
	}
};

export const categoryService = {
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
};
