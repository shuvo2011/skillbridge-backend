import { prisma } from "../../lib/prisma";

const getTutorProfile = async (userId: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	return tutorProfile;
};

const getMyCategories = async (userId: string) => {
	const tutorProfile = await getTutorProfile(userId);

	return await prisma.tutorCategory.findMany({
		where: { tutorId: tutorProfile.id },
		include: {
			category: {
				select: {
					id: true,
					name: true,
					status: true,
				},
			},
		},
	});
};

const addCategory = async (userId: string, categoryId: string) => {
	const tutorProfile = await getTutorProfile(userId);

	const category = await prisma.category.findUnique({
		where: { id: categoryId },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	const existing = await prisma.tutorCategory.findFirst({
		where: { tutorId: tutorProfile.id, categoryId },
	});

	if (existing) {
		throw new Error("Category already added");
	}

	return await prisma.tutorCategory.create({
		data: {
			tutorId: tutorProfile.id,
			categoryId,
		},
		include: {
			category: {
				select: {
					id: true,
					name: true,
					status: true,
				},
			},
		},
	});
};

const removeCategory = async (userId: string, id: string) => {
	const tutorProfile = await getTutorProfile(userId);

	const existing = await prisma.tutorCategory.findFirst({
		where: { id, tutorId: tutorProfile.id },
	});

	if (!existing) {
		throw new Error("Category not found");
	}

	return await prisma.tutorCategory.delete({
		where: { id },
	});
};

export const tutorCategoryService = {
	getMyCategories,
	addCategory,
	removeCategory,
};
