import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type {
  AdminDashboardData,
  DeveloperDashboardData,
  ProjectManagerDashboardData,
} from "../types/dashboard";

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
      "/dashboard/admin",
    );
    return response.data.data;
  },

  getProjectManagerDashboard: async (): Promise<ProjectManagerDashboardData> => {
    const response = await apiClient.get<ApiResponse<ProjectManagerDashboardData>>(
      "/dashboard/project-manager",
    );
    return response.data.data;
  },

  getDeveloperDashboard: async (): Promise<DeveloperDashboardData> => {
    const response = await apiClient.get<ApiResponse<DeveloperDashboardData>>(
      "/dashboard/developer",
    );
    return response.data.data;
  },
};
