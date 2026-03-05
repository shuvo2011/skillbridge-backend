import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { checkUserStatus } from "../../middleware/checkUserStatus";
import { reviewController } from "./review.controller";

const router = express.Router();

router.post("/", authenticate(UserRole.STUDENT), checkUserStatus, reviewController.createReview);
router.get("/tutor/:tutorId", reviewController.getTutorReviews); // public

export const reviewRouter: Router = router;
