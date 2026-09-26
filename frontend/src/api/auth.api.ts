import { apiClient } from "./client";
import type {
  ApiResponse,
  AuthSuccessData,
  AuthUser,
  LoginCredentials,
} from "../types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSuccessData> => {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>(
      "/auth/login",
      credentials,
    );
    return response.data.data;
  },

  refresh: async (): Promise<AuthSuccessData> => {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>(
      "/auth/refresh",
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<{ ok: boolean }>>("/auth/logout");
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data.data;
  },
};
