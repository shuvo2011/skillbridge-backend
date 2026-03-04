import { Request, Response } from "express";
import { tutorAvailabilityService } from "./tutorAvailability.service";
import { DayOfWeek } from "../../../generated/prisma/enums";

const VALID_DAYS = Object.values(DayOfWeek);
const isValidTime = (t: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

// GET /api/tutor/availability
const getAllAvailability = async (req: Request, res: Response) => {
	try {
		const tutorId = req.user?.id;

		const data = await tutorAvailabilityService.getAllAvailability(tutorId as string);

		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// GET /api/tutor/availability/:id
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

// POST /api/tutor/availability
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

		// Exactly 1 hour check
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

// PUT /api/tutor/availability/:id
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

		// 1 hour check — দুটোই দিলে তখনই check করো
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

		const data = await tutorAvailabilityService.updateAvailability(userId as string, id, {
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

// DELETE /api/tutor/availability/:id
const deleteAvailability = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		await tutorAvailabilityService.deleteAvailability(userId, id);

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
