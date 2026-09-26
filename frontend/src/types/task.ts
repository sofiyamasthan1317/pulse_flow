export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Task = {
  id: string;
  projectId: string;
  assignedDeveloperId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  isOverdue: boolean;
  overdueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  assignedDeveloper?: {
    id: string;
    name: string;
    email: string;
  };
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  assignedDeveloperId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type TaskQueryFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueFrom?: string;
  dueTo?: string;
};
