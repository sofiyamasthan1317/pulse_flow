import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";

type NotificationTransaction = Pick<typeof prisma, "notification">;

const buildAssignmentMessage = (taskTitle: string, projectName: string): string => {
  return `You were assigned "${taskTitle}" in ${projectName}.`;
};

const buildInReviewMessage = (taskTitle: string): string => {
  return `Task "${taskTitle}" was moved to In Review.`;
};

export const notificationsService = {
  createTaskAssignmentNotification: async (
    task: { id: string; title: string; assignedDeveloperId: string; project?: { name: string } | null },
    projectNameOverride?: string,
    tx: NotificationTransaction = prisma as NotificationTransaction,
  ) => {
    const projectName = projectNameOverride ?? task.project?.name ?? "the project";
    const message = buildAssignmentMessage(task.title, projectName);

    return tx.notification.create({
      data: {
        userId: task.assignedDeveloperId,
        message,
      },
    });
  },

  createTaskInReviewNotification: async (
    task: { id: string; title: string },
    projectManagerId: string,
    tx: NotificationTransaction = prisma as NotificationTransaction,
  ) => {
    return tx.notification.create({
      data: {
        userId: projectManagerId,
        message: buildInReviewMessage(task.title),
      },
    });
  },

  getUserNotifications: async (userId: string, limit = 50) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  getUnreadNotificationCount: async (userId: string) => {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  markNotificationAsRead: async (notificationId: string, userId: string) => {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, isRead: true },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    if (notification.userId !== userId) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    if (notification.isRead) {
      return notification;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  markAllNotificationsAsRead: async (userId: string) => {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      updatedCount: result.count,
    };
  },
};
