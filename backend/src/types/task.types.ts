export type TaskStatusValue = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriorityValue = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskCreateInput = {
  title: string;
  description?: string;
  assignedDeveloperId: string;
  status?: TaskStatusValue;
  priority?: TaskPriorityValue;
  dueDate?: string | Date | null;
};

export type TaskUpdateInput = Partial<TaskCreateInput> & {
  status?: TaskStatusValue;
};

export type TaskRecord = {
  id: string;
  projectId: string;
  assignedDeveloperId: string;
  title: string;
  description: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDate: Date | null;
  isOverdue: boolean;
  overdueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
