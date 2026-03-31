import { prisma } from "../../lib/prisma";
type UpdateTutorPayload = {
	// tutor_profiles table
	bio?: string;
	qualification?: string;
	experienceYears?: number;
	phone?: string;
	address?: string;
	profilePicture?: string;
	price?: number;
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
			tutorCategories: {
				include: {
					category: { // ← এটা add করো
						select: { id: true, name: true },
					},
				},
			},
			reviews: {
				select: { rating: true },
			},
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
	return await prisma.tutorProfiles.findUnique({
		where: { id },
		include: {
			user: {
				select: { name: true, email: true, image: true },
			},
			tutorCategories: {
				include: {
					category: { // ← এটা add করো
						select: { id: true, name: true },
					},
				},
			},
			availability: {
				select: { id: true, tutorId: true, availableFrom: true,availableTo:true, dayOfWeek:true },
			},
			reviews: {
				include: {
					student: {
						include: {
							user: { select: { name: true, image: true } },
						},
					},
					booking: {
						select: {
							sessionDate: true,
							category: { select: { name: true } },
						},
					},
				},

			},
		},
	});
};

const updateTutorProfile = async (userId: string, payload: UpdateTutorPayload) => {
	const existing = await prisma.tutorProfiles.findUnique({
		where: { userId },
	});

	if (!existing) {
		throw new Error("Tutor not found");
	}

	const { bio, qualification, experienceYears, phone, address, profilePicture, name, email, price } = payload;

	const tutorData = {
		...(bio !== undefined && { bio }),
		...(qualification !== undefined && { qualification }),
		...(experienceYears !== undefined && { experienceYears }),
		...(phone !== undefined && { phone }),
		...(address !== undefined && { address }),
		...(profilePicture !== undefined && { profilePicture }),
		...(price !== undefined && { price }),
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
