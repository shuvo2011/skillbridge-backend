import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { tutorController } from "./tutorProfile.controller";

const router = express.Router();

// Public routes
router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);

// Protected routes
router.put("/profile", authenticate(UserRole.TUTOR), tutorController.updateTutorProfile);
router.delete("/:id", authenticate(UserRole.ADMIN), tutorController.deleteTutor);

export const tutorProfileRouter: Router = router;
