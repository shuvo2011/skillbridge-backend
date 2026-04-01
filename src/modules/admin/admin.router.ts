// modules/admin/admin.router.ts
import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get("/users", authenticate(UserRole.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", authenticate(UserRole.ADMIN), adminController.updateUserStatus);

export const adminRouter: Router = router;