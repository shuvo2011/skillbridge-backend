import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { categoryRouter } from "./modules/category/category.router";
import { studentRouter } from "./modules/student/student.router";
import { userRouter } from "./modules/user/user.router";
import { tutorProfileRouter } from "./modules/tutorProfile/tutorProfile.router";
import { tutorAvailabilityRouter } from "./modules/tutorAvailability/tutorAvailability.router";
import { tutorCategoryRouter } from "./modules/tutorCategory/tutorCategory.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { reviewRouter } from "./modules/review/review.router";
import { adminRouter } from "./modules/admin/admin.router";

const app: Application = express();

app.use(
	cors({
		origin: process.env.APP_URL || "http://localhost:3000",
		credentials: true,
	}),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/api/students", studentRouter);
app.use("/api/users", userRouter);
app.use("/api/tutors", tutorProfileRouter);
app.use("/api/tutor/availability", tutorAvailabilityRouter);
app.use("/api/tutor/categories", tutorCategoryRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
	res.send("Thank you for visiting SkillBridge and showing your interest.");
});

export default app;
