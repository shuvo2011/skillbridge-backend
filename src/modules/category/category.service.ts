import { CategoryStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

type CreateCategoryPayload = {
	name: string;
	status?: CategoryStatus;
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

export const categoryService = {
	createCategory,
};
