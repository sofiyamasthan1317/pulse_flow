import { Router } from "express";

import { activitiesController } from "../controllers/activities/activities.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const activitiesRoutes = Router();

activitiesRoutes.use(authMiddleware);
activitiesRoutes.get("/:projectId/activities", activitiesController.getProjectActivities);

export default activitiesRoutes;
