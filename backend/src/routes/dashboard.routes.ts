import { Router } from "express";

import { roles } from "../constants/roles.js";
import { dashboardController } from "../controllers/dashboard/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/admin", requireRoles(roles.ADMIN), dashboardController.getAdminDashboard);
dashboardRoutes.get("/project-manager", requireRoles(roles.PROJECT_MANAGER), dashboardController.getProjectManagerDashboard);
dashboardRoutes.get("/developer", requireRoles(roles.DEVELOPER), dashboardController.getDeveloperDashboard);

export default dashboardRoutes;
