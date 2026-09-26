import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Task, UpdateTaskInput } from "../types/task";

export const tasksApi = {
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/tasks/${taskId}`);
  },
};
