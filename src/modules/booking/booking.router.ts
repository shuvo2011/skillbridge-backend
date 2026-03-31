import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { checkUserStatus } from "../../middleware/checkUserStatus";
import { bookingController } from "./booking.controller";

const router = express.Router();
router.get("/booked-slots", bookingController.getBookedSlots);
router.get("/reviewable", authenticate(UserRole.STUDENT), checkUserStatus, bookingController.getReviewableBookings);
router.post("/", authenticate(UserRole.STUDENT), checkUserStatus, bookingController.createBooking);
router.get("/", authenticate(UserRole.STUDENT, UserRole.TUTOR), checkUserStatus, bookingController.getMyBookings);
router.get("/:id", authenticate(UserRole.STUDENT, UserRole.TUTOR), checkUserStatus, bookingController.getBookingById);
router.patch("/:id/cancel", authenticate(UserRole.STUDENT), checkUserStatus, bookingController.cancelBooking);
router.patch("/:id/complete", authenticate(UserRole.TUTOR), checkUserStatus, bookingController.completeBooking);

export const bookingRouter: Router = router;
