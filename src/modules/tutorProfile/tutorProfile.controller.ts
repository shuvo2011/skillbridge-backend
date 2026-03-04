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
		const { bio, qualification, experienceYears, phone, address, profilePicture, name, email } = req.body;

		const result = await tutorService.updateTutorProfile(userId as string, {
			bio,
			qualification,
			experienceYears,
			phone,
			address,
			profilePicture,
			name,
			email,
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

export const tutorController = {
	getAllTutors,
	getTutorById,
	updateTutorProfile,
	deleteTutor,
};
