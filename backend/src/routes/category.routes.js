import { Router } from "express";
import * as controller from "../controllers/category.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, controller.getAll);
router.post("/", authenticate, authorizeRoles("admin"), controller.create);

export default router;
