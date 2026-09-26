import { AppError } from "../../middleware/error.middleware.js";
import type { TaskCreateInput, TaskPriorityValue, TaskStatusValue, TaskUpdateInput } from "../../types/task.types.js";

const allowedStatuses = new Set<TaskStatusValue>(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const allowedPriorities = new Set<TaskPriorityValue>(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const parseDueDate = (value?: string | Date | null): Date | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid due date", 400, "VALIDATION_ERROR");
  }

  return date;
};

const parseDueDateFilter = (value: string | undefined, boundary: "from" | "to"): Date | undefined => {
  if (!value) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD.", 400, "VALIDATION_ERROR");
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Invalid due date", 400, "VALIDATION_ERROR");
  }

  if (boundary === "to") {
    return new Date(`${value}T23:59:59.999Z`);
  }

  return parsed;
};

export type TaskQueryFilterInput = {
  status?: TaskStatusValue;
  priority?: TaskPriorityValue;
  dueFrom?: Date;
  dueTo?: Date;
};

export const validateTaskInput = (input: TaskCreateInput | TaskUpdateInput, isUpdate = false): TaskCreateInput | TaskUpdateInput => {
  if (!isUpdate && !input.title?.trim()) {
    throw new AppError("Task title is required", 400, "VALIDATION_ERROR");
  }

  if (!isUpdate && (!input.assignedDeveloperId || !input.assignedDeveloperId.trim())) {
    throw new AppError("Assigned developer is required", 400, "VALIDATION_ERROR");
  }

  if (input.title !== undefined && !input.title.trim()) {
    throw new AppError("Task title is required", 400, "VALIDATION_ERROR");
  }

  if (input.assignedDeveloperId !== undefined && !input.assignedDeveloperId.trim()) {
    throw new AppError("Assigned developer is required", 400, "VALIDATION_ERROR");
  }

  if (input.status !== undefined && !allowedStatuses.has(input.status)) {
    throw new AppError("Invalid task status", 400, "VALIDATION_ERROR");
  }

  if (input.priority !== undefined && !allowedPriorities.has(input.priority)) {
    throw new AppError("Invalid task priority", 400, "VALIDATION_ERROR");
  }

  const sanitizedTitle = input.title?.trim();
  const sanitizedDescription = input.description?.trim();
  const sanitizedAssignedDeveloperId = input.assignedDeveloperId?.trim();
  const dueDate = parseDueDate(input.dueDate);

  return {
    ...input,
    ...(sanitizedTitle !== undefined ? { title: sanitizedTitle } : {}),
    ...(sanitizedDescription !== undefined ? { description: sanitizedDescription } : {}),
    ...(sanitizedAssignedDeveloperId !== undefined ? { assignedDeveloperId: sanitizedAssignedDeveloperId } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    dueDate,
  };
};

export const validateTaskQueryInput = (query: Record<string, unknown>): TaskQueryFilterInput => {
  const status = query.status;
  const priority = query.priority;
  const dueFromRaw = typeof query.dueFrom === "string" ? query.dueFrom : undefined;
  const dueToRaw = typeof query.dueTo === "string" ? query.dueTo : undefined;

  if (status !== undefined && typeof status === "string" && !allowedStatuses.has(status as TaskStatusValue)) {
    throw new AppError("Invalid task status", 400, "VALIDATION_ERROR");
  }

  if (priority !== undefined && typeof priority === "string" && !allowedPriorities.has(priority as TaskPriorityValue)) {
    throw new AppError("Invalid task priority", 400, "VALIDATION_ERROR");
  }

  const dueFrom = parseDueDateFilter(dueFromRaw, "from");
  const dueTo = parseDueDateFilter(dueToRaw, "to");

  if (dueFrom && dueTo && dueFrom.getTime() > dueTo.getTime()) {
    throw new AppError("dueFrom must be earlier than or equal to dueTo", 400, "VALIDATION_ERROR");
  }

  return {
    ...(typeof status === "string" ? { status: status as TaskStatusValue } : {}),
    ...(typeof priority === "string" ? { priority: priority as TaskPriorityValue } : {}),
    ...(dueFrom ? { dueFrom } : {}),
    ...(dueTo ? { dueTo } : {}),
  };
};
