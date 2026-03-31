import { prisma } from "../../lib/prisma";

// Student এর studentId বের করো
const getStudentProfile = async (userId: string) => {
	const student = await prisma.student.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!student) throw new Error("Student profile not found");
	return student;
};

// Tutor এর tutorId বের করো
const getTutorProfile = async (userId: string) => {
	const tutor = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutor) throw new Error("Tutor profile not found");
	return tutor;
};

// CREATE booking
// service এ categoryId add করো
const createBooking = async (userId: string, availabilityId: string, sessionDate: string, categoryId: string) => {
	const student = await getStudentProfile(userId);

	const availability = await prisma.tutorAvailability.findUnique({
		where: { id: availabilityId },
	});

	if (!availability) throw new Error("Availability slot not found");

	// category exists check
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
	});
	if (!category) throw new Error("Category not found");

	const date = new Date(sessionDate);
	const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
	const dateDayOfWeek = days[date.getDay()];

	if (dateDayOfWeek !== availability.dayOfWeek) {
		throw new Error(`Selected date is a ${dateDayOfWeek} but slot is for ${availability.dayOfWeek}`);
	}

	const conflict = await prisma.booking.findFirst({
		where: {
			tutorId: availability.tutorId,
			sessionDate: new Date(sessionDate),
			slotFrom: availability.availableFrom,
			status: { not: "CANCELLED" },
		},
	});
	if (conflict) throw new Error("This slot is already booked");

	const studentConflict = await prisma.booking.findFirst({
		where: {
			studentId: student.id,
			sessionDate: new Date(sessionDate),
			slotFrom: availability.availableFrom,
			status: { not: "CANCELLED" },
		},
	});
	if (studentConflict) throw new Error("You already have a booking at this time");

	return await prisma.booking.create({
		data: {
			studentId: student.id,
			tutorId: availability.tutorId,
			availabilityId,
			categoryId, // ← add করো
			sessionDate: new Date(sessionDate),
			slotFrom: availability.availableFrom,
			slotTo: availability.availableTo,
			status: "CONFIRMED",
		},
		include: {
			student: { include: { user: { select: { name: true, email: true } } } },
			tutor: { include: { user: { select: { name: true, email: true } } } },
			availability: true,
			category: { select: { id: true, name: true } },
		},
	});
};


const getBookedSlots = async (tutorId: string, date: string) => {
	const bookings = await prisma.booking.findMany({
		where: {
			tutorId,
			sessionDate: new Date(date),
			status: { not: "CANCELLED" },
		},
		select: { slotFrom: true, slotTo: true },
	});
	return bookings;
};

// GET my bookings (student বা tutor উভয়ের জন্য)
const getMyBookings = async (userId: string, role: string) => {
	if (role === "STUDENT") {
		const student = await getStudentProfile(userId);
		return await prisma.booking.findMany({
			where: { studentId: student.id },
			include: {
				tutor: { include: { user: { select: { name: true, email: true, image:true } } } },
				availability: true,
				category: { select: { id: true, name: true } },
			},
			orderBy: { sessionDate: "desc" },
		});
	} else {
		const tutor = await getTutorProfile(userId);
		return await prisma.booking.findMany({
			where: { tutorId: tutor.id },
			include: {
				student: { include: { user: { select: { name: true, email: true , image: true} } } },
				availability: true,
				category: { select: { id: true, name: true } },
			},
			orderBy: { sessionDate: "desc" },
		});
	}
};

// GET booking by id
const getBookingById = async (userId: string, role: string, id: string) => {
	const booking = await prisma.booking.findUnique({
		where: { id },
		include: {
			student: { include: { user: { select: { name: true, email: true } } } },
			tutor: { include: { user: { select: { name: true, email: true } } } },
			availability: true,
		},
	});

	if (!booking) throw new Error("Booking not found");

	// শুধু নিজের booking দেখতে পারবে
	if (role === "STUDENT") {
		const student = await getStudentProfile(userId);
		if (booking.studentId !== student.id) throw new Error("Unauthorized");
	} else {
		const tutor = await getTutorProfile(userId);
		if (booking.tutorId !== tutor.id) throw new Error("Unauthorized");
	}

	return booking;
};

// CANCEL booking (student করবে)
const cancelBooking = async (userId: string, id: string) => {
	const student = await getStudentProfile(userId);

	const booking = await prisma.booking.findFirst({
		where: { id, studentId: student.id },
	});

	if (!booking) throw new Error("Booking not found");
	if (booking.status === "CANCELLED") throw new Error("Booking already cancelled");
	if (booking.status === "COMPLETED") throw new Error("Completed booking cannot be cancelled");

	return await prisma.booking.update({
		where: { id },
		data: { status: "CANCELLED" },
	});
};

// COMPLETE booking (tutor করবে)
const completeBooking = async (userId: string, id: string) => {
	const tutor = await getTutorProfile(userId);

	const booking = await prisma.booking.findFirst({
		where: { id, tutorId: tutor.id },
	});

	if (!booking) throw new Error("Booking not found");
	if (booking.status === "CANCELLED") throw new Error("Cancelled booking cannot be completed");
	if (booking.status === "COMPLETED") throw new Error("Booking already completed");

	return await prisma.booking.update({
		where: { id },
		data: { status: "COMPLETED" },
	});
};
const getReviewableBookings = async (userId: string, tutorId: string) => {
	const student = await getStudentProfile(userId);

	return await prisma.booking.findMany({
		where: {
			studentId: student.id,
			tutorId,
			status: "COMPLETED",
			review: null,  // review নেই এমন
		},
		select: {
			id: true,
			sessionDate: true,
			slotFrom: true,
			slotTo: true,
			category: { select: { name: true } },
		},
		orderBy: { sessionDate: "desc" },
	});
};
export const bookingService = {
	createBooking,
	getMyBookings,
	getBookingById,
	cancelBooking,
	completeBooking,
	getBookedSlots,
	getReviewableBookings,
};
