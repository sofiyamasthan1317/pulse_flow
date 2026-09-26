import type { NextFunction, Response } from "express";

import { AppError } from "../../middleware/error.middleware.js";
import { activitiesService } from "../../services/activities/activities.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { sendSuccess } from "../../utils/response.js";

export const activitiesController = {
  getProjectActivities: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      const activities = await activitiesService.getProjectActivities(projectId, req.user);
      res.status(200).json(sendSuccess(activities, "Project activity retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },
};
