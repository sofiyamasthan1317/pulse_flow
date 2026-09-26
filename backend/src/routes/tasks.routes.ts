import { Router } from "express";

import { tasksController } from "../controllers/tasks/tasks.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const tasksRoutes = Router();

tasksRoutes.use(authMiddleware);

tasksRoutes.get("/:taskId", tasksController.getTaskById);
tasksRoutes.patch("/:taskId", tasksController.updateTask);
tasksRoutes.delete("/:taskId", tasksController.deleteTask);

export default tasksRoutes;
