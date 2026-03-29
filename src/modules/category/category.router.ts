import express, { Router } from "express";
import { categoryController } from "./category.controller";
import { authenticate, UserRole } from "../../middleware/authenticate";

const router = express.Router();

router.post("/", authenticate(UserRole.ADMIN), categoryController.createCategory);
router.get("/", authenticate(UserRole.ADMIN), categoryController.getAllCategories);
router.get("/:id", authenticate(UserRole.ADMIN), categoryController.getCategoryById);
router.put("/:id", authenticate(UserRole.ADMIN), categoryController.updateCategory);
router.delete("/:id", authenticate(UserRole.ADMIN), categoryController.deleteCategory);
export const categoryRouter: Router = router;
