import { useCallback, useEffect, useState } from "react";
import { notificationsApi } from "../api/notifications.api";
import { useSocket } from "./useSocket";
import type { Notification } from "../types/notification";
import { extractErrorMessage } from "../utils/errors";

export type UseNotificationsReturn = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

/**
 * Shared hook for notification state.
 * Fetches the full notification list and syncs with Socket.io real-time events.
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { latestNotification, realtimeUnreadCount } = useSocket();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.listNotifications();
      setNotifications(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Handle real-time incoming notification
  useEffect(() => {
    if (!latestNotification) return;

    setNotifications((prev) => {
      if (prev.some((n) => n.id === latestNotification.id)) {
        return prev;
      }

      const newNotif: Notification = {
        id: latestNotification.id,
        userId: latestNotification.userId,
        message: latestNotification.message,
        isRead: latestNotification.isRead,
        createdAt: latestNotification.createdAt,
      };

      return [newNotif, ...prev];
    });
  }, [latestNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const updated = await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    } catch {
      // Silently fail — read state is non-critical
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Silently fail
    }
  }, []);

  const derivedUnreadCount = notifications.filter((n) => !n.isRead).length;
  // Use realtimeUnreadCount if higher/updated or fallback to derived
  const unreadCount = realtimeUnreadCount !== null ? realtimeUnreadCount : derivedUnreadCount;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
