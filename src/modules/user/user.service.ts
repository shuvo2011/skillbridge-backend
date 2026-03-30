import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import bcrypt from "bcrypt";
// user.service.ts এ add করো
// user.service.ts
const updateUserInfo = async (userId: string, data: { name?: string; email?: string; image?: string }) => { // ✅ image যোগ
	if (data.email) {
		const existing = await prisma.user.findFirst({
			where: { email: data.email, NOT: { id: userId } },
		});

		if (existing) {
			throw new Error("Email already in use");
		}
	}

	return await prisma.user.update({
		where: { id: userId },
		data: {
			...(data.name && { name: data.name }),
			...(data.email && { email: data.email }),
			...(data.image && { image: data.image }), // ✅ image যোগ
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			image: true, // ✅ response এ image যোগ
		},
	});
};

// user.service.ts এ add করো
const changePassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
	const account = await prisma.account.findFirst({
		where: { userId },
		select: { id: true, password: true },
	});

	if (!account || !account.password) {
		throw new Error("Account not found");
	}

	// ✅ bcrypt এর বদলে Better Auth এর password hasher ব্যবহার করো
	const ctx = await auth.$context;
	const isMatch = await ctx.password.verify({
		hash: account.password,
		password: data.currentPassword,
	});

	if (!isMatch) {
		throw new Error("Current password is incorrect");
	}

	// ✅ নতুন password ও Better Auth দিয়ে hash করো
	const hashedPassword = await ctx.password.hash(data.newPassword);

	await prisma.account.update({
		where: { id: account.id },
		data: { password: hashedPassword },
	});

	return { message: "Password updated successfully" };
};
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
	updateUserInfo,
	changePassword,
	banUser,
	unbanUser,
};
