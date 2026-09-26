import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type { CreateProjectInput, Project, UpdateProjectInput } from "../types/project";
import type { CreateTaskInput, Task, TaskQueryFilters } from "../types/task";

export const projectsApi = {
  listProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects");
    return response.data.data;
  },

  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return response.data.data;
  },

  createProject: async (data: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>("/projects", data);
    return response.data.data;
  },

  updateProject: async (projectId: string, data: UpdateProjectInput): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${projectId}`, data);
    return response.data.data;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/projects/${projectId}`);
  },

  listTasksForProject: async (projectId: string, filters?: TaskQueryFilters): Promise<Task[]> => {
    const response = await apiClient.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, {
      params: filters,
    });
    return response.data.data;
  },

  createTaskForProject: async (projectId: string, data: CreateTaskInput): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data.data;
  },
};
