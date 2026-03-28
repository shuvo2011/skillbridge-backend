import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				banned: true,
				banReason: true,
				banExpires: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.banned) {
			if (user.banExpires && new Date(user.banExpires) < new Date()) {
				await prisma.user.update({
					where: { id: userId },
					data: { banned: false, banReason: null, banExpires: null },
				});
			} else {
				return res.status(403).json({
					error: "Account banned",
					details: user.banReason || "You have been banned",
					banExpires: user.banExpires,
				});
			}
		}

		next();
	} catch (error: any) {
		res.status(500).json({
			error: "Status check failed",
			details: error.message,
		});
	}
};
