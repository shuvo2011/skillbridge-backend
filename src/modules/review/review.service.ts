import { prisma } from "../../lib/prisma";

const createReview = async (userId: string, bookingId: string, rating: number, reviewText: string) => {
	// Student profile বের করো
	const student = await prisma.student.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!student) throw new Error("Student profile not found");

	// Booking exists and belongs to this student check
	const booking = await prisma.booking.findFirst({
		where: { id: bookingId, studentId: student.id },
	});

	if (!booking) throw new Error("Booking not found");

	// Booking COMPLETED হতে হবে
	if (booking.status !== "COMPLETED") {
		throw new Error("You can only review after the session is completed");
	}

	// Already reviewed check
	const existing = await prisma.review.findUnique({
		where: { bookingId },
	});

	if (existing) throw new Error("You have already reviewed this session");

	// Rating 1-5 হতে হবে
	if (rating < 1 || rating > 5) {
		throw new Error("Rating must be between 1 and 5");
	}

	return await prisma.review.create({
		data: {
			studentId: student.id,
			tutorId: booking.tutorId,
			bookingId,
			rating,
			reviewText,
		},
		include: {
			student: { include: { user: { select: { name: true } } } },
			tutor: { include: { user: { select: { name: true } } } },
		},
	});
};

const getTutorReviews = async (tutorId: string) => {
	const reviews = await prisma.review.findMany({
		where: { tutorId },
		include: {
			student: { include: { user: { select: { name: true } } } },
		},
		orderBy: { createdAt: "desc" },
	});

	// Average rating calculate করো
	const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

	return {
		averageRating: Math.round(averageRating * 10) / 10, // 4.3 এরকম
		totalReviews: reviews.length,
		reviews,
	};
};

export const reviewService = {
	createReview,
	getTutorReviews,
};
