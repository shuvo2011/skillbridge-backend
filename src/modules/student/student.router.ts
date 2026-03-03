import express, { Router } from "express";
import { studentController } from "./student.controller";
import { authenticate, UserRole } from "../../middleware/authenticate";

const router = express.Router();

router.get("/", authenticate(UserRole.ADMIN), studentController.getAllStudents);
router.get("/:id", authenticate(UserRole.ADMIN, UserRole.STUDENT), studentController.getStudentById);
router.patch("/:id", authenticate(UserRole.ADMIN, UserRole.STUDENT), studentController.updateStudent);
router.delete("/:id", authenticate(UserRole.ADMIN), studentController.deleteStudent);

export const studentRouter: Router = router;
