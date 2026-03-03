import { Request, Response } from "express";
import { userService } from "./user.service";
import { requireUser } from "../../middleware/requireUser";

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
	banUser,
	unbanUser,
};
