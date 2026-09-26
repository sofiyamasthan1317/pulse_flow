import type { NextFunction, Response } from "express";

import { roles } from "../../constants/roles.js";
import { AppError } from "../../middleware/error.middleware.js";
import { tasksService } from "../../services/tasks/tasks.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { sendSuccess } from "../../utils/response.js";
import { validateTaskInput, validateTaskQueryInput } from "../../validators/tasks/task.validator.js";

export const tasksController = {
  createTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      if (req.user.role !== roles.ADMIN && req.user.role !== roles.PROJECT_MANAGER) {
        throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
      }

      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      const validated = validateTaskInput(req.body);
      const task = await tasksService.createTask(projectId, validated as Parameters<typeof tasksService.createTask>[1], req.user);
      res.status(201).json(sendSuccess(task, "Task created successfully"));
    } catch (error) {
      next(error);
    }
  },

  listTasksForProject: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const projectId = req.params.projectId;
      if (!projectId || Array.isArray(projectId)) {
        throw new AppError("Project id is required", 400, "VALIDATION_ERROR");
      }

      const filters = validateTaskQueryInput(req.query as Record<string, unknown>);
      const tasks = await tasksService.listTasksForProject(projectId, req.user, filters);
      res.status(200).json(sendSuccess(tasks, "Tasks retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const taskId = req.params.taskId;
      if (!taskId || Array.isArray(taskId)) {
        throw new AppError("Task id is required", 400, "VALIDATION_ERROR");
      }

      const task = await tasksService.getTaskById(taskId, req.user);
      res.status(200).json(sendSuccess(task, "Task retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  updateTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const validated = validateTaskInput(req.body, true);
      const taskId = req.params.taskId;
      if (!taskId || Array.isArray(taskId)) {
        throw new AppError("Task id is required", 400, "VALIDATION_ERROR");
      }

      const task = await tasksService.updateTask(taskId, validated as Parameters<typeof tasksService.updateTask>[1], req.user);
      res.status(200).json(sendSuccess(task, "Task updated successfully"));
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const taskId = req.params.taskId;
      if (!taskId || Array.isArray(taskId)) {
        throw new AppError("Task id is required", 400, "VALIDATION_ERROR");
      }

      await tasksService.deleteTask(taskId, req.user);
      res.status(200).json(sendSuccess({ deleted: true }, "Task deleted successfully"));
    } catch (error) {
      next(error);
    }
  },
};
