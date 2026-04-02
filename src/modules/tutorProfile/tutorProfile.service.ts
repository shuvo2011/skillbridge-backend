import { prisma } from "../../lib/prisma";
type UpdateTutorPayload = {
	bio?: string;
	qualification?: string;
	experienceYears?: number;
	phone?: string;
	address?: string;
	profilePicture?: string;
	price?: number;

	name?: string;
	email?: string;
};

const getAllTutors = async () => {
	return await prisma.tutorProfiles.findMany({
		orderBy: { isFeatured: "desc" },
		include: {
			user: {
				select: {
					name: true,
					email: true,
					image: true,
					banned: true,
				},
			},
			tutorCategories: {
				include: {
					category: {
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

const getTutorById = async (id: string) => {
	return await prisma.tutorProfiles.findUnique({
		where: { id },
		include: {
			user: {
				select: { name: true, email: true, image: true, banned: true },
			},
			tutorCategories: {
				include: {
					category: {
						select: { id: true, name: true },
					},
				},
			},
			availability: {
				select: { id: true, tutorId: true, availableFrom: true, availableTo: true, dayOfWeek: true },
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

const getMyStats = async (userId: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) throw new Error("Tutor profile not found");

	const [totalSessions, confirmedSessions, completedSessions, cancelledSessions, revenueData, totalStudents] =
		await prisma.$transaction([
			prisma.booking.count({ where: { tutorId: tutorProfile.id } }),
			prisma.booking.count({ where: { tutorId: tutorProfile.id, status: "CONFIRMED" } }),
			prisma.booking.count({ where: { tutorId: tutorProfile.id, status: "COMPLETED" } }),
			prisma.booking.count({ where: { tutorId: tutorProfile.id, status: "CANCELLED" } }),
			prisma.booking.findMany({
				where: { tutorId: tutorProfile.id, status: "COMPLETED" },
				select: { price: true },
			}),
			prisma.booking.findMany({
				where: { tutorId: tutorProfile.id },
				select: { studentId: true },
				distinct: ["studentId"],
			}),
		]);

	const totalRevenue = revenueData.reduce((sum, b) => sum + parseFloat(b.price?.toString() ?? "0"), 0);

	return {
		totalSessions,
		confirmedSessions,
		completedSessions,
		cancelledSessions,
		totalRevenue,
		totalStudents: totalStudents.length,
	};
};
const toggleFeatured = async (id: string) => {
	const profile = await prisma.tutorProfiles.findUnique({
		where: { id },
	});

	if (!profile) throw new Error("Tutor profile not found");

	return await prisma.tutorProfiles.update({
		where: { id },
		data: { isFeatured: !profile.isFeatured },
	});
};

export const tutorService = {
	getAllTutors,
	getMyProfile,
	getTutorById,
	updateTutorProfile,
	deleteTutor,
	getMyStats,
	toggleFeatured,
};
