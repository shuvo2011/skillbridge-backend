import { Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id as string;
		const { bookingId, rating, reviewText } = req.body;

		if (!bookingId || !rating || !reviewText) {
			res.status(400).json({
				success: false,
				message: "bookingId, rating and reviewText are required",
			});
			return;
		}

		if (typeof rating !== "number" || rating < 1 || rating > 5) {
			res.status(400).json({
				success: false,
				message: "Rating must be a number between 1 and 5",
			});
			return;
		}

		const data = await reviewService.createReview(userId, bookingId, rating, reviewText);

		res.status(201).json({
			success: true,
			message: "Review submitted successfully",
			data,
		});
	} catch (error: any) {
		const status = error.message.includes("not found")
			? 404
			: error.message.includes("already reviewed")
				? 409
				: error.message.includes("only review")
					? 403
					: 500;
		res.status(status).json({ success: false, message: error.message });
	}
};

const getTutorReviews = async (req: Request, res: Response) => {
	try {
		const { tutorId } = req.params;

		const data = await reviewService.getTutorReviews(tutorId as string);

		res.status(200).json({ success: true, data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const reviewController = {
	createReview,
	getTutorReviews,
};
