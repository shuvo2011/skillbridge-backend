import { Request, Response } from "express";
import { tutorService } from "./tutorProfile.service";

const getAllTutors = async (req: Request, res: Response) => {
	try {
		const result = await tutorService.getAllTutors();
		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Failed to fetch tutors",
			details: error.message,
		});
	}
};


const getMyProfile = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const profile = await tutorService.getMyProfile(userId as string);

		if (!profile) {
			return res.status(200).json({});
		}

		res.status(200).json(profile);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

const getTutorById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await tutorService.getTutorById(id as string);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Failed to fetch tutor",
			details: error.message,
		});
	}
};

const updateTutorProfile = async (req: Request, res: Response) => {
	try {
		// authenticate middleware থেকে userId আসবে
		const userId = req.user?.id;
		const { bio, qualification, experienceYears, phone, address, profilePicture, name, email, price } = req.body;

		const result = await tutorService.updateTutorProfile(userId as string, {
			bio,
			qualification,
			experienceYears,
			phone,
			address,
			profilePicture,
			price,
			name,
			email
		});

		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Tutor profile update failed",
			details: error.message,
		});
	}
};

const deleteTutor = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await tutorService.deleteTutor(id as string);

		res.status(200).json({
			message: "Tutor deleted successfully",
			data: result,
		});
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Tutor deletion failed",
			details: error.message,
		});
	}
};
const getMyStats = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const data = await tutorService.getMyStats(userId);
		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};
export const tutorController = {
	getAllTutors,
	getMyProfile,
	getTutorById,
	updateTutorProfile,
	deleteTutor,
	getMyStats,
};
