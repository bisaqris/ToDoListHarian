import { Router } from "express";
import * as controller from "../controllers/report.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/monthly", controller.getMonthlyReport);
router.get("/daily", controller.getDailyRecaps);
router.get("/unfinished-yesterday", controller.getUnfinishedYesterday);

router.post(
  "/recap/run",
  authorizeRoles("admin"),
  controller.triggerDailyRecap,
);

export default router;
