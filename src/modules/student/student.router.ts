import express, { Router } from "express";
import { studentController } from "./student.controller";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { checkUserStatus } from "../../middleware/checkUserStatus";

const router = express.Router();


// ✅ /profile আগে
router.get("/profile", authenticate(UserRole.STUDENT), checkUserStatus, studentController.getMyProfile);
router.put("/profile", authenticate(UserRole.STUDENT), checkUserStatus, studentController.updateMyProfile);

router.get("/", authenticate(UserRole.ADMIN), studentController.getAllStudents);
router.get("/:id", authenticate(UserRole.ADMIN, UserRole.STUDENT), checkUserStatus, studentController.getStudentById);
router.patch("/:id", authenticate(UserRole.ADMIN, UserRole.STUDENT), checkUserStatus, studentController.updateStudent);
router.delete("/:id", authenticate(UserRole.ADMIN), studentController.deleteStudent);

export const studentRouter: Router = router;
