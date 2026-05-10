import { Router } from "express";
import * as controller from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, controller.getAll);

export default router;
