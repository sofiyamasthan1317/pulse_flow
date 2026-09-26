import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Notification } from "../types/notification";

export const notificationsApi = {
  listNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>("/notifications");
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      "/notifications/unread-count",
    );
    return response.data.data.unreadCount;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch<ApiResponse<null>>("/notifications/read-all");
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`,
    );
    return response.data.data;
  },
};
