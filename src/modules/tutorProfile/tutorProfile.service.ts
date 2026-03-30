import { prisma } from "../../lib/prisma";
type UpdateTutorPayload = {
	// tutor_profiles table
	bio?: string;
	qualification?: string;
	experienceYears?: number;
	phone?: string;
	address?: string;
	profilePicture?: string;
	// user table
	name?: string;
	email?: string;
};
// GET all tutors
const getAllTutors = async () => {
	return await prisma.tutorProfiles.findMany({
		include: {
			user: {
				select: {
					name: true,
					email: true,
				},
			},
			tutorCategories: true,
		},
	});
};


const getMyProfile = async (userId: string) => {
	return await prisma.tutorProfiles.findUnique({
		where: { userId },
	});
};

// GET single tutor
const getTutorById = async (id: string) => {
	const tutor = await prisma.tutorProfiles.findUnique({
		where: { id },
		include: {
			user: {
				select: {
					name: true,
					email: true,
				},
			},
			tutorCategories: true,
			availability: true,
			reviews: true,
		},
	});

	if (!tutor) {
		throw new Error("Tutor not found");
	}

	return tutor;
};

const updateTutorProfile = async (userId: string, payload: UpdateTutorPayload) => {
	const existing = await prisma.tutorProfiles.findUnique({
		where: { userId },
	});

	if (!existing) {
		throw new Error("Tutor not found");
	}

	const { bio, qualification, experienceYears, phone, address, profilePicture, name, email } = payload;

	const tutorData = {
		...(bio !== undefined && { bio }),
		...(qualification !== undefined && { qualification }),
		...(experienceYears !== undefined && { experienceYears }),
		...(phone !== undefined && { phone }),
		...(address !== undefined && { address }),
		...(profilePicture !== undefined && { profilePicture }),
	};

	const userData = {
		...(name !== undefined && { name }),
		...(email !== undefined && { email }),
	};

	const [updatedTutor] = await prisma.$transaction([
		prisma.tutorProfiles.update({
			where: { userId },
			data: tutorData,
			include: { user: true },
		}),
		prisma.user.update({
			where: { id: userId },
			data: userData,
		}),
	]);

	return updatedTutor;
};

// DELETE tutor
const deleteTutor = async (id: string) => {
	const existing = await prisma.tutorProfiles.findUnique({
		where: { id },
	});

	if (!existing) {
		throw new Error("Tutor not found");
	}

	const [deletedTutor] = await prisma.$transaction([
		prisma.tutorProfiles.delete({
			where: { id },
		}),
		prisma.user.delete({
			where: { id: existing.userId },
		}),
	]);

	return deletedTutor;
};

export const tutorService = {
	getAllTutors,
	getMyProfile,
	getTutorById,
	updateTutorProfile,
	deleteTutor,
};
