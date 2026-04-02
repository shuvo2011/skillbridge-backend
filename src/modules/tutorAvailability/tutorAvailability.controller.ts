import { Request, Response } from "express";
import { tutorAvailabilityService } from "./tutorAvailability.service";
import { DayOfWeek } from "../../../generated/prisma/enums";
import { paginationHelper } from "../../helpers/paginationHelper";

const VALID_DAYS = Object.values(DayOfWeek);
const isValidTime = (t: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

const getAllAvailability = async (req: Request, res: Response) => {
	const search = typeof req.query.search === "string" ? req.query.search : undefined;
	const q = paginationHelper(req);

	const payload: any = { ...q };
	if (search) payload.search = search;
	payload.tutorId = req.user?.id;

	try {
		const result = await tutorAvailabilityService.getAllAvailability(payload);
		res.status(200).json(result);
	} catch (error) {
		console.error("Error retrieving availability:", error);
		res.status(500).json({ message: "Something went wrong", error });
	}
};

const getAvailabilityById = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		const data = await tutorAvailabilityService.getAvailabilityById(userId, id as string);

		res.status(200).json({
			success: true,
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const createAvailability = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const { dayOfWeek, availableFrom, availableTo } = req.body;

		if (!dayOfWeek || !availableFrom || !availableTo) {
			res.status(400).json({
				success: false,
				message: "dayOfWeek, availableFrom and availableTo are required",
			});
			return;
		}

		if (!VALID_DAYS.includes(dayOfWeek)) {
			res.status(400).json({
				success: false,
				message: `Invalid dayOfWeek. Valid values: ${VALID_DAYS.join(", ")}`,
			});
			return;
		}

		if (!isValidTime(availableFrom) || !isValidTime(availableTo)) {
			res.status(400).json({
				success: false,
				message: "Time must be in HH:MM format (e.g. 09:00)",
			});
			return;
		}

		const [fromHour, fromMin] = availableFrom.split(":").map(Number);
		const [toHour, toMin] = availableTo.split(":").map(Number);
		const diffMinutes = toHour * 60 + toMin - (fromHour * 60 + fromMin);

		if (diffMinutes !== 60) {
			res.status(400).json({
				success: false,
				message: "Slot must be exactly 1 hour (e.g. 09:00 to 10:00)",
			});
			return;
		}

		const data = await tutorAvailabilityService.createAvailability(
			userId as string,
			dayOfWeek as DayOfWeek,
			availableFrom,
			availableTo,
		);

		res.status(201).json({
			success: true,
			message: "Availability created successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("already exists") || error.message.includes("overlaps") ? 409 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const updateAvailability = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const { id } = req.params;
		const { dayOfWeek, availableFrom, availableTo } = req.body;

		if (dayOfWeek && !VALID_DAYS.includes(dayOfWeek)) {
			res.status(400).json({
				success: false,
				message: `Invalid dayOfWeek. Valid values: ${VALID_DAYS.join(", ")}`,
			});
			return;
		}

		if (availableFrom && !isValidTime(availableFrom)) {
			res.status(400).json({
				success: false,
				message: "availableFrom must be in HH:MM format (e.g. 09:00)",
			});
			return;
		}

		if (availableTo && !isValidTime(availableTo)) {
			res.status(400).json({
				success: false,
				message: "availableTo must be in HH:MM format (e.g. 09:00)",
			});
			return;
		}

		if (availableFrom && availableTo) {
			const [fromHour, fromMin] = availableFrom.split(":").map(Number);
			const [toHour, toMin] = availableTo.split(":").map(Number);
			const diffMinutes = toHour * 60 + toMin - (fromHour * 60 + fromMin);

			if (diffMinutes !== 60) {
				res.status(400).json({
					success: false,
					message: "Slot must be exactly 1 hour (e.g. 09:00 to 10:00)",
				});
				return;
			}
		}

		const data = await tutorAvailabilityService.updateAvailability(userId as string, id as string, {
			dayOfWeek,
			availableFrom,
			availableTo,
		});

		res.status(200).json({
			success: true,
			message: "Availability updated successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found")
			? 404
			: error.message.includes("overlaps") || error.message.includes("already exists")
				? 409
				: error.message.includes("Unauthorized")
					? 403
					: 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const deleteAvailability = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		await tutorAvailabilityService.deleteAvailability(userId, id as string);

		res.status(200).json({
			success: true,
			message: "Availability slot deleted successfully",
		});
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

export const tutorAvailabilityController = {
	getAllAvailability,
	getAvailabilityById,
	createAvailability,
	updateAvailability,
	deleteAvailability,
};
