import { apiClient } from "./client";
import type { ActivityLog } from "../types/activity";
import type { ApiResponse } from "../types/auth";

export const activitiesApi = {
  getProjectActivities: async (projectId: string): Promise<ActivityLog[]> => {
    const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
      `/projects/${projectId}/activities`,
    );
    return response.data.data;
  },
};
