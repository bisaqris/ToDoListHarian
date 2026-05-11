import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), controller.getAll);

export default router;
