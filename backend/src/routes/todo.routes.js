import { Router } from "express";
import * as controller from "../controllers/todo.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", controller.getAll);
router.post("/", controller.create);
router.get("/:id/transitions", controller.getTransitions);
router.patch("/:id/status", controller.transitionStatus);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
