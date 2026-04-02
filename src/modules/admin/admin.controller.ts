import { Request, Response } from "express";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
	try {
		const search = typeof req.query.search === "string" ? req.query.search : undefined;
		const role = typeof req.query.role === "string" ? req.query.role : undefined;

		const data = await adminService.getAllUsers({ search, role });
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const updateUserStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { banned, banReason } = req.body;

		const data = await adminService.updateUserStatus(id as string, { banned, banReason });
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const getAllBookings = async (req: Request, res: Response) => {
	try {
		const search = typeof req.query.search === "string" ? req.query.search : undefined;
		const status = typeof req.query.status === "string" ? req.query.status : undefined;

		const data = await adminService.getAllBookings({ search, status });
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const getStats = async (req: Request, res: Response) => {
	try {
		const data = await adminService.getStats();
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};
const getBookingTrends = async (req: Request, res: Response) => {
	try {
		const data = await adminService.getBookingTrends();
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};
export const adminController = { getAllUsers, updateUserStatus, getAllBookings, getStats, getBookingTrends };
