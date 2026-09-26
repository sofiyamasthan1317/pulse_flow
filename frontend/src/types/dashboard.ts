import type { TaskPriority, TaskStatus } from "./task";

export type AdminDashboardData = {
  totalProjects: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
};

export type UpcomingTask = {
  id: string;
  title: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  isOverdue?: boolean;
  project: {
    id: string;
    name: string;
  };
};

export type ProjectManagerDashboardData = {
  totalProjects: number;
  totalTasks: number;
  tasksByPriority: Record<TaskPriority, number>;
  upcomingDueTasks: UpcomingTask[];
};

export type DeveloperTask = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  isOverdue?: boolean;
  project: {
    id: string;
    name: string;
  };
  assignedDeveloper?: {
    id: string;
  };
};

export type DeveloperDashboardData = {
  totalAssignedTasks: number;
  tasks: DeveloperTask[];
};
