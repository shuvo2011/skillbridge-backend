import { prisma } from "../../lib/prisma";

type UpdateStudentPayload = {
	bio?: string;
	phone?: string;
	address?: string;
	profilePicture?: string;
	name?: string;
	email?: string;
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

export const studentService = {
	getAllStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
};
