import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { AuthenticatedUser } from "../../types/auth.types.js";

export const activitiesService = {
  getProjectActivities: async (projectId: string, actor: AuthenticatedUser) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, creatorId: true },
    });

    if (!project) {
      throw new AppError("Project not found", 404, "NOT_FOUND");
    }

    if (actor.role === "ADMIN") {
      return prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        include: {
          task: {
            select: { id: true, title: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    if (actor.role === "PROJECT_MANAGER") {
      if (project.creatorId !== actor.userId) {
        throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
      }

      return prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        include: {
          task: {
            select: { id: true, title: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    const assignedTasks = await prisma.task.findMany({
      where: {
        projectId,
        assignedDeveloperId: actor.userId,
      },
      select: { id: true },
    });

    if (!assignedTasks.length) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    const assignedTaskIds = assignedTasks.map((task) => task.id);

    return prisma.activityLog.findMany({
      where: {
        projectId,
        taskId: {
          in: assignedTaskIds,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },
};
