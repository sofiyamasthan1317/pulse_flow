import { Router } from "express";

import { roles } from "../constants/roles.js";
import { projectsController } from "../controllers/projects/projects.controller.js";
import { tasksController } from "../controllers/tasks/tasks.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";

const projectsRoutes = Router();

projectsRoutes.use(authMiddleware);

projectsRoutes.post("/", requireRoles(roles.ADMIN, roles.PROJECT_MANAGER), projectsController.createProject);
projectsRoutes.get("/", projectsController.listProjects);
projectsRoutes.get("/:projectId", projectsController.getProjectById);
projectsRoutes.patch("/:projectId", requireRoles(roles.ADMIN, roles.PROJECT_MANAGER), projectsController.updateProject);
projectsRoutes.delete("/:projectId", requireRoles(roles.ADMIN, roles.PROJECT_MANAGER), projectsController.deleteProject);
projectsRoutes.post("/:projectId/tasks", requireRoles(roles.ADMIN, roles.PROJECT_MANAGER), tasksController.createTask);
projectsRoutes.get("/:projectId/tasks", tasksController.listTasksForProject);

export default projectsRoutes;
