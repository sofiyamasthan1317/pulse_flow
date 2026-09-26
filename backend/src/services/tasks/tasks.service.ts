import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { notificationsService } from "../notifications/notifications.service.js";
import type { AuthenticatedUser } from "../../types/auth.types.js";
import type { TaskCreateInput, TaskPriorityValue, TaskStatusValue, TaskUpdateInput } from "../../types/task.types.js";
import type { TaskQueryFilterInput } from "../../validators/tasks/task.validator.js";
import { emitActivityCreated, emitNotificationCreated } from "../../websocket/socket.js";

const ensureTaskAccess = async (taskId: string, actor: AuthenticatedUser) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignedDeveloper: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404, "NOT_FOUND");
  }

  if (actor.role === "ADMIN") {
    return task;
  }

  if (actor.role === "PROJECT_MANAGER") {
    if (task.project.creatorId !== actor.userId) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }
    return task;
  }

  if (task.assignedDeveloperId !== actor.userId) {
    throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
  }

  return task;
};

const ensureProjectAccessForTaskMutation = async (projectId: string, actor: AuthenticatedUser): Promise<void> => {
  if (actor.role === "ADMIN") {
    return;
  }

  if (actor.role === "PROJECT_MANAGER") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    if (!project || project.creatorId !== actor.userId) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }
    return;
  }

  throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
};

const buildTaskListWhere = (projectId: string, actor: AuthenticatedUser, filters?: TaskQueryFilterInput) => {
  const where: Record<string, unknown> = {
    projectId,
  };

  if (actor.role === "DEVELOPER") {
    where.assignedDeveloperId = actor.userId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.dueFrom || filters?.dueTo) {
    const dueDateFilter: Record<string, Date> = {};

    if (filters.dueFrom) {
      dueDateFilter.gte = filters.dueFrom;
    }

    if (filters.dueTo) {
      dueDateFilter.lte = filters.dueTo;
    }

    where.dueDate = dueDateFilter;
  }

  return where;
};

export const tasksService = {
  listTasksForProject: async (projectId: string, actor: AuthenticatedUser, filters?: TaskQueryFilterInput) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, creatorId: true },
    });

    if (!project) {
      throw new AppError("Project not found", 404, "NOT_FOUND");
    }

    if (actor.role === "PROJECT_MANAGER" && project.creatorId !== actor.userId) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    if (actor.role === "DEVELOPER") {
      const hasAccess = await prisma.task.findFirst({
        where: {
          projectId,
          assignedDeveloperId: actor.userId,
        },
        select: { id: true },
      });

      if (!hasAccess) {
        throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
      }
    }

    return prisma.task.findMany({
      where: buildTaskListWhere(projectId, actor, filters),
      include: {
        assignedDeveloper: {
          select: { id: true, name: true, email: true, role: true },
        },
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getTaskById: async (taskId: string, actor: AuthenticatedUser) => {
    return ensureTaskAccess(taskId, actor);
  },

  createTask: async (projectId: string, input: TaskCreateInput, actor: AuthenticatedUser) => {
    await ensureProjectAccessForTaskMutation(projectId, actor);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) {
      throw new AppError("Project not found", 404, "NOT_FOUND");
    }

    const developer = await prisma.user.findUnique({
      where: { id: input.assignedDeveloperId },
      select: { id: true, role: true },
    });

    if (!developer || developer.role !== "DEVELOPER") {
      throw new AppError("Assigned developer is invalid", 400, "VALIDATION_ERROR");
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          projectId,
          assignedDeveloperId: input.assignedDeveloperId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          status: input.status ?? "TODO",
          priority: input.priority ?? "MEDIUM",
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
        include: {
          assignedDeveloper: {
            select: { id: true, name: true, email: true, role: true },
          },
          project: true,
        },
      });

      await notificationsService.createTaskAssignmentNotification(createdTask, project.name, tx);
      return createdTask;
    });

    await emitNotificationCreated({
      id: `notification-${result.id}`,
      userId: result.assignedDeveloperId,
      message: `You were assigned "${result.title}" in ${project.name}.`,
      isRead: false,
      createdAt: new Date(),
      taskId: result.id,
      projectId: result.projectId,
    });

    return result;
  },

  updateTask: async (taskId: string, input: TaskUpdateInput, actor: AuthenticatedUser) => {
    const task = await ensureTaskAccess(taskId, actor);

    if (actor.role === "DEVELOPER") {
      const allowedKeys = new Set(["status"]);
      const suppliedKeys = Object.keys(input);

      if (suppliedKeys.some((key) => !allowedKeys.has(key))) {
        throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
      }
    }

    if (input.assignedDeveloperId) {
      const dev = await prisma.user.findUnique({
        where: { id: input.assignedDeveloperId },
        select: { id: true, role: true },
      });

      if (!dev || dev.role !== "DEVELOPER") {
        throw new AppError("Assigned developer is invalid", 400, "VALIDATION_ERROR");
      }
    }

    const previousStatus = task.status;
    const previousAssignedDeveloperId = task.assignedDeveloperId;
    const nextStatus = input.status ?? previousStatus;

    const updatedTask = await prisma.$transaction(async (tx) => {
      const nextTask = await tx.task.update({
        where: { id: taskId },
        data: {
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
          ...(input.assignedDeveloperId !== undefined ? { assignedDeveloperId: input.assignedDeveloperId } : {}),
        },
        include: {
          assignedDeveloper: {
            select: { id: true, name: true, email: true, role: true },
          },
          project: true,
        },
      });

      if (previousStatus !== nextStatus) {
        await tx.activityLog.create({
          data: {
            taskId: nextTask.id,
            projectId: nextTask.projectId,
            userId: actor.userId,
            previousStatus,
            newStatus: nextStatus,
            message: `Task status changed from ${previousStatus} to ${nextStatus}`,
          },
        });
      }

      if (input.assignedDeveloperId !== undefined && input.assignedDeveloperId !== previousAssignedDeveloperId) {
        await notificationsService.createTaskAssignmentNotification(nextTask, nextTask.project.name, tx);
      }

      if (nextStatus === "IN_REVIEW" && previousStatus !== "IN_REVIEW") {
        await notificationsService.createTaskInReviewNotification(nextTask, task.project.creatorId, tx);
      }

      return nextTask;
    });

    if (previousStatus !== nextStatus) {
      await emitActivityCreated({
        id: `activity-${updatedTask.id}-${Date.now()}`,
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
        userId: actor.userId,
        userName: actor.name,
        role: actor.role,
        previousStatus,
        newStatus: nextStatus,
        message: `Task status changed from ${previousStatus} to ${nextStatus}`,
        createdAt: new Date(),
      });
    }

    if (input.assignedDeveloperId !== undefined && input.assignedDeveloperId !== previousAssignedDeveloperId) {
      await emitNotificationCreated({
        id: `notification-${updatedTask.id}-${Date.now()}`,
        userId: input.assignedDeveloperId,
        message: `You were assigned "${updatedTask.title}" in ${updatedTask.project.name}.`,
        isRead: false,
        createdAt: new Date(),
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
      });
    }

    if (nextStatus === "IN_REVIEW" && previousStatus !== "IN_REVIEW") {
      await emitNotificationCreated({
        id: `notification-${updatedTask.id}-review-${Date.now()}`,
        userId: task.project.creatorId,
        message: `Task "${updatedTask.title}" was moved to In Review.`,
        isRead: false,
        createdAt: new Date(),
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
      });
    }

    return updatedTask;
  },

  deleteTask: async (taskId: string, actor: AuthenticatedUser) => {
    const task = await ensureTaskAccess(taskId, actor);

    if (actor.role === "DEVELOPER") {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    try {
      await prisma.task.delete({
        where: { id: task.id },
      });
      return true;
    } catch {
      throw new AppError("Task cannot be deleted because it has related records", 409, "CONFLICT");
    }
  },
};
