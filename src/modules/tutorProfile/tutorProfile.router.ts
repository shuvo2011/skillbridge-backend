import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { tutorController } from "./tutorProfile.controller";
import { checkUserStatus } from "../../middleware/checkUserStatus";

const router = express.Router();



// Protected routes
router.get("/profile", authenticate(UserRole.TUTOR), checkUserStatus, tutorController.getMyProfile);
router.put("/profile", authenticate(UserRole.TUTOR), checkUserStatus, tutorController.updateTutorProfile);
router.delete("/:id", authenticate(UserRole.ADMIN), tutorController.deleteTutor);

// Public routes
router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);


export const tutorProfileRouter: Router = router;
