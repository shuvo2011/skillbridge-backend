import { Request, Response } from "express";
import { studentService } from "./student.service";

const getMyProfile = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const profile = await studentService.getMyProfile(userId as string);
		res.status(200).json(profile);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};

const updateMyProfile = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const profile = await studentService.updateMyProfile(userId as string, req.body);
		res.status(200).json(profile);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};

const getAllStudents = async (req: Request, res: Response) => {
	try {
		const result = await studentService.getAllStudents();

		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Failed to fetch students",
			details: error.message,
		});
	}
};

const getStudentById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = await studentService.getStudentById(id as string);

		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 404).json({
			error: "Student not found",
			details: error.message,
		});
	}
};

const updateStudent = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { bio, phone, address, profilePicture, name, email } = req.body;

		const result = await studentService.updateStudent(id as string, {
			bio,
			phone,
			address,
			profilePicture,
			name,
			email,
		});

		res.status(200).json(result);
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Student update failed",
			details: error.message,
		});
	}
};

const deleteStudent = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = await studentService.deleteStudent(id as string);

		res.status(200).json({
			message: "Student deleted successfully",
			data: result,
		});
	} catch (error: any) {
		res.status(error.statusCode || 500).json({
			error: "Student deletion failed",
			details: error.message,
		});
	}
};
const getMyStats = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const stats = await studentService.getMyStats(userId as string);
		res.status(200).json({ success: true, data: stats });
	} catch (error: any) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};
export const studentController = {
	getMyProfile,
	updateMyProfile,
	getAllStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
	getMyStats,
};
