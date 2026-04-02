import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { tutorController } from "./tutorProfile.controller";
import { checkUserStatus } from "../../middleware/checkUserStatus";

const router = express.Router();

router.get("/stats", authenticate(UserRole.TUTOR), checkUserStatus, tutorController.getMyStats);

router.get("/profile", authenticate(UserRole.TUTOR), checkUserStatus, tutorController.getMyProfile);
router.put("/profile", authenticate(UserRole.TUTOR), checkUserStatus, tutorController.updateTutorProfile);
router.delete("/:id", authenticate(UserRole.ADMIN), tutorController.deleteTutor);

router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);

router.patch("/:id/featured", authenticate(UserRole.ADMIN), tutorController.toggleFeatured);
export const tutorProfileRouter: Router = router;
