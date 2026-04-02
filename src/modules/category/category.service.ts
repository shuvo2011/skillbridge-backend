import { CategoryStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta } from "../../helpers/paginationHelper";
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

	const where: any = {
		...(s
			? {
					OR: [{ name: { contains: s, mode: "insensitive" } }, { status: { contains: s, mode: "insensitive" } }],
				}
			: {}),
	};

	const allowedSort = ["createdAt", "updatedAt", "name"];
	const sortBy = allowedSort.includes(payload.sortBy) ? payload.sortBy : "createdAt";

	try {
		const [total, data] = await prisma.$transaction([
			prisma.category.count({ where }),
			prisma.category.findMany({
				where,
				orderBy: { [sortBy]: payload.sortOrder },
				skip: payload.skip,
				take: payload.take,
			}),
		]);

		return {
			meta: buildPaginationMeta(payload.page, payload.limit, total),
			data,
		};
	} catch (error) {
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
