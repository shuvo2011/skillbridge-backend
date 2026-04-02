import { Request, Response } from "express";
import { userService } from "./user.service";
import { requireUser } from "../../middleware/requireUser";

const updateUserInfo = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const { name, email, image } = req.body;

		const updated = await userService.updateUserInfo(userId as string, { name, email, image });

		res.status(200).json(updated);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};
const changePassword = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const { currentPassword, newPassword } = req.body;

		const updated = await userService.changePassword(userId as string, { currentPassword, newPassword });
		res.status(200).json(updated);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
};
const banUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const { banReason, banExpires } = req.body;

		const me = requireUser(req);

		const result = await userService.banUser(
			userId as string,
			me.id,
			banReason,
			banExpires ? new Date(banExpires) : null,
		);

		return res.status(200).json({ message: "User banned successfully", data: result });
	} catch (error: any) {
		return res.status(400).json({ error: error.message });
	}
};

const unbanUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		const result = await userService.unbanUser(userId as string);

		res.status(200).json({
			message: "User unbanned successfully",
			data: result,
		});
	} catch (error: any) {
		res.status(400).json({
			error: error.message,
		});
	}
};

export const userController = {
	updateUserInfo,
	changePassword,
	banUser,
	unbanUser,
};
