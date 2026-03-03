import express, { Router } from "express";
import { userController } from "./user.controller";
import { authenticate, UserRole } from "../../middleware/authenticate";

const router = express.Router();

router.patch("/ban/:userId", authenticate(UserRole.ADMIN), userController.banUser);
router.patch("/unban/:userId", authenticate(UserRole.ADMIN), userController.unbanUser);

export const userRouter: Router = router;
