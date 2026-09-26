import type { NextFunction, Response } from "express";

import { AppError } from "../../middleware/error.middleware.js";
import { dashboardService } from "../../services/dashboard/dashboard.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { sendSuccess } from "../../utils/response.js";

export const dashboardController = {
  getAdminDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const dashboard = await dashboardService.getAdminDashboard();
      res.status(200).json(sendSuccess(dashboard, "Admin dashboard retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  getProjectManagerDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const dashboard = await dashboardService.getProjectManagerDashboard(req.user.userId);
      res.status(200).json(sendSuccess(dashboard, "Project manager dashboard retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  getDeveloperDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const dashboard = await dashboardService.getDeveloperDashboard(req.user.userId);
      res.status(200).json(sendSuccess(dashboard, "Developer dashboard retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },
};
