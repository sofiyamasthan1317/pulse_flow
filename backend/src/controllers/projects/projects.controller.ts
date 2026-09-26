import type { NextFunction, Request, Response } from "express";

import { roles } from "../../constants/roles.js";
import { AppError } from "../../middleware/error.middleware.js";
import { projectsService } from "../../services/projects/projects.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { sendSuccess } from "../../utils/response.js";
import { validateProjectInput } from "../../validators/projects/project.validator.js";

export const projectsController = {
  createProject: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      if (req.user.role !== roles.ADMIN && req.user.role !== roles.PROJECT_MANAGER) {
        throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
      }

      const validated = validateProjectInput(req.body);
      const project = await projectsService.createProject(validated as Parameters<typeof projectsService.createProject>[0], req.user);
      res.status(201).json(sendSuccess(project, "Project created successfully"));
    } catch (error) {
      next(error);
    }
  },

  listProjects: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const projects = await projectsService.listProjects(req.user);
      res.status(200).json(sendSuccess(projects, "Projects retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  getProjectById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      const project = await projectsService.getProjectById(projectId, req.user);
      res.status(200).json(sendSuccess(project, "Project retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  updateProject: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const validated = validateProjectInput(req.body, true);
      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      const project = await projectsService.updateProject(projectId, validated as Parameters<typeof projectsService.updateProject>[1], req.user);
      res.status(200).json(sendSuccess(project, "Project updated successfully"));
    } catch (error) {
      next(error);
    }
  },

  deleteProject: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      await projectsService.deleteProject(projectId, req.user);
      res.status(200).json(sendSuccess({ deleted: true }, "Project deleted successfully"));
    } catch (error) {
      next(error);
    }
  },
};
