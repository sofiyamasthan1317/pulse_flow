import type { NextFunction, Response } from "express";

import { AppError } from "../../middleware/error.middleware.js";
import { notificationsService } from "../../services/notifications/notifications.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { sendSuccess } from "../../utils/response.js";
import { emitUserUnreadCount } from "../../websocket/socket.js";

export const notificationsController = {
  listNotifications: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const notifications = await notificationsService.getUserNotifications(req.user.userId);
      res.status(200).json(sendSuccess(notifications, "Notifications retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  getUnreadCount: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const unreadCount = await notificationsService.getUnreadNotificationCount(req.user.userId);
      res.status(200).json(sendSuccess({ unreadCount }, "Unread notification count retrieved successfully"));
    } catch (error) {
      next(error);
    }
  },

  markNotificationAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const notificationId = req.params.notificationId;
      if (!notificationId || Array.isArray(notificationId)) {
        throw new AppError("Notification id is required", 400, "VALIDATION_ERROR");
      }

      const notification = await notificationsService.markNotificationAsRead(notificationId, req.user.userId);
      await emitUserUnreadCount(req.user.userId);
      res.status(200).json(sendSuccess(notification, "Notification marked as read"));
    } catch (error) {
      next(error);
    }
  },

  markAllNotificationsAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const result = await notificationsService.markAllNotificationsAsRead(req.user.userId);
      await emitUserUnreadCount(req.user.userId);
      res.status(200).json(sendSuccess(result, "All notifications marked as read"));
    } catch (error) {
      next(error);
    }
  },
};
