import { prisma } from "../../lib/prisma";

type UpdateStudentPayload = {
	bio?: string;
	phone?: string;
	address?: string;
	profilePicture?: string;
	name?: string;
	email?: string;
};


// services/student.service.ts
const getMyProfile = async (userId: string) => {
	const student = await prisma.student.findFirst({
		where: { userId },
		include: {
			user: {
				select: {
					name: true,
					email: true,
					image: true,
				},
			},
		},
	});

	if (!student) throw new Error("Profile not found");
	return student;
};

const updateMyProfile = async (userId: string, data: { phone?: string; address?: string; bio?: string }) => {
	return await prisma.student.update({
		where: { userId },
		data: {
			...(data.phone !== undefined && { phone: data.phone }),
			...(data.address !== undefined && { address: data.address }),
			...(data.bio !== undefined && { bio: data.bio }),
		},
	});
};

const getAllStudents = async () => {
	return await prisma.student.findMany({
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});
};

const getStudentById = async (id: string) => {
	const student = await prisma.student.findUnique({
		where: { id },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});

	if (!student) {
		throw new Error("Student not found");
	}

	return student;
};

const updateStudent = async (id: string, payload: UpdateStudentPayload) => {
	const existing = await prisma.student.findUnique({
		where: { id },
		include: { user: true },
	});

	if (!existing) {
		throw new Error("Student not found");
	}

	const { bio, phone, address, profilePicture, name, email } = payload;

	// undefined হলে object এ include করবে না
	const studentData = {
		...(bio !== undefined && { bio }),
		...(phone !== undefined && { phone }),
		...(address !== undefined && { address }),
		...(profilePicture !== undefined && { profilePicture }),
	};

	const userData = {
		...(name !== undefined && { name }),
		...(email !== undefined && { email }),
	};

	const [updatedStudent] = await prisma.$transaction([
		prisma.student.update({
			where: { id },
			data: studentData,
			include: { user: true },
		}),
		prisma.user.update({
			where: { id: existing.userId },
			data: userData,
		}),
	]);

	return updatedStudent;
};

const deleteStudent = async (id: string) => {
	const existing = await prisma.student.findUnique({
		where: { id },
	});

	if (!existing) {
		throw new Error("Student not found");
	}

	const [deletedStudent] = await prisma.$transaction([
		prisma.student.delete({
			where: { id },
		}),
		prisma.user.delete({
			where: { id: existing.userId },
		}),
	]);

	return deletedStudent;
};
const getMyStats = async (userId: string) => {
	const student = await prisma.student.findFirst({
		where: { userId },
	});

	if (!student) throw new Error("Student not found");

	const bookings = await prisma.booking.findMany({
		where: { studentId: student.id },
	});

	const totalBookings = bookings.length;
	const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
	const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
	const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;
	const uniqueTutors = new Set(bookings.map((b) => b.tutorId)).size;

	return {
		totalBookings,
		confirmedBookings,
		completedBookings,
		cancelledBookings,
		uniqueTutors,
	};
};
export const studentService = {
	getMyProfile,
	updateMyProfile,
	getAllStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
	getMyStats,
};
