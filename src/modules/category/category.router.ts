import express, { Router } from "express";
import { categoryController } from "./category.controller";
import { authenticate, UserRole } from "../../middleware/authenticate";

const router = express.Router();

router.post("/", authenticate(UserRole.ADMIN), categoryController.createCategory);

export const categoryRouter: Router = router;
