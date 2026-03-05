import express, { Router } from "express";
import { authenticate, UserRole } from "../../middleware/authenticate";
import { checkUserStatus } from "../../middleware/checkUserStatus";
import { tutorCategoryController } from "./tutorCategory.controller";

const router = express.Router();

router.get("/", authenticate(UserRole.TUTOR), checkUserStatus, tutorCategoryController.getMyCategories);
router.post("/", authenticate(UserRole.TUTOR), checkUserStatus, tutorCategoryController.addCategory);
router.delete("/:id", authenticate(UserRole.TUTOR), checkUserStatus, tutorCategoryController.removeCategory);

export const tutorCategoryRouter: Router = router;
