import { prisma } from "../../lib/prisma";

const banUser = async (userId: string, adminId: string, reason?: string, expiresAt?: Date | null) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.banned) {
		throw new Error("User is already banned");
	}

	if (userId === adminId) {
		throw new Error("Admin cannot ban himself");
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			banned: true,
			banReason: reason || "Violated terms of service",
			banExpires: expiresAt ?? null,
		},
	});

	return updatedUser;
};

const unbanUser = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (!user.banned) {
		throw new Error("User is not banned");
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			banned: false,
			banReason: null,
			banExpires: null,
		},
	});

	return updatedUser;
};

export const userService = {
	banUser,
	unbanUser,
};
