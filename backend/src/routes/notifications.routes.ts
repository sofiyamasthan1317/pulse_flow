import { Router } from "express";

import { notificationsController } from "../controllers/notifications/notifications.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const notificationsRoutes = Router();

notificationsRoutes.use(authMiddleware);
notificationsRoutes.get("/", notificationsController.listNotifications);
notificationsRoutes.get("/unread-count", notificationsController.getUnreadCount);
notificationsRoutes.patch("/read-all", notificationsController.markAllNotificationsAsRead);
notificationsRoutes.patch("/:notificationId/read", notificationsController.markNotificationAsRead);

export default notificationsRoutes;
