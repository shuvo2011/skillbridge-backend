import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { tutorAvailabilityController } from "./tutorAvailability.controller";
import { checkUserStatus } from "../../middleware/checkUserStatus";

const router = express.Router();

router.get("/", authenticate(UserRole.TUTOR), checkUserStatus, tutorAvailabilityController.getAllAvailability);
router.get("/:id", authenticate(UserRole.TUTOR), checkUserStatus, tutorAvailabilityController.getAvailabilityById);
router.post("/", authenticate(UserRole.TUTOR), checkUserStatus, tutorAvailabilityController.createAvailability);
router.put("/:id", authenticate(UserRole.TUTOR), checkUserStatus, tutorAvailabilityController.updateAvailability);
router.delete("/:id", authenticate(UserRole.TUTOR), checkUserStatus, tutorAvailabilityController.deleteAvailability);

export const tutorAvailabilityRouter: Router = router;
