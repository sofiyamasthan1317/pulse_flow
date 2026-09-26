import type { TaskStatus } from "./task";

export type ActivityLog = {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  previousStatus?: TaskStatus | null;
  newStatus: TaskStatus;
  message: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  task?: {
    id: string;
    title: string;
  };
};
