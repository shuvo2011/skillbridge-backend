import { Request, Response } from "express";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { availabilityId, sessionDate } = req.body;

		if (!availabilityId || !sessionDate) {
			res.status(400).json({
				success: false,
				message: "availabilityId and sessionDate are required",
			});
			return;
		}

		// Past date check
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const selected = new Date(sessionDate);
		selected.setHours(0, 0, 0, 0);

		if (selected < today) {
			res.status(400).json({
				success: false,
				message: "Cannot book a session in the past",
			});
			return;
		}

		const data = await bookingService.createBooking(userId, availabilityId, sessionDate);

		res.status(201).json({
			success: true,
			message: "Booking confirmed successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found")
			? 404
			: error.message.includes("already booked") || error.message.includes("already have")
				? 409
				: error.message.includes("Unauthorized")
					? 403
					: 500;
		res.status(status).json({ success: false, message: error.message });
	}
};
const getMyBookings = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const role = req.user?.role as string;

		const data = await bookingService.getMyBookings(userId, role);

		res.status(200).json({ success: true, data });
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const getBookingById = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const role = req.user?.role as string;
		const { id } = req.params;

		const data = await bookingService.getBookingById(userId, role, id);

		res.status(200).json({ success: true, data });
	} catch (error: any) {
		const status = error.message.includes("not found") ? 404 : error.message.includes("Unauthorized") ? 403 : 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const cancelBooking = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		const data = await bookingService.cancelBooking(userId, id);

		res.status(200).json({
			success: true,
			message: "Booking cancelled successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found")
			? 404
			: error.message.includes("cannot") || error.message.includes("already")
				? 400
				: 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const completeBooking = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { id } = req.params;

		const data = await bookingService.completeBooking(userId, id);

		res.status(200).json({
			success: true,
			message: "Booking marked as completed",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found")
			? 404
			: error.message.includes("cannot") || error.message.includes("already")
				? 400
				: 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

export const bookingController = {
	createBooking,
	getMyBookings,
	getBookingById,
	cancelBooking,
	completeBooking,
};
