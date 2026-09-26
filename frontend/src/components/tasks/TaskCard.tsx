import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth.store";
import type { Task, TaskStatus } from "../../types/task";
import { OverdueBadge } from "../dashboard/OverdueBadge";
import { PriorityBadge } from "../dashboard/PriorityBadge";
import { StatusBadge } from "../dashboard/StatusBadge";
import { TaskStatusSelect } from "./TaskStatusSelect";

type TaskCardProps = {
  task: Task;
  basePath: string;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
};

export const TaskCard = ({
  task,
  basePath,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) => {
  const { user } = useAuth();

  const canEditDetails = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
  const developerName = task.assignedDeveloper?.name || task.assignedDeveloper?.email || "Unassigned";
  const projectName = task.project?.name || "Project";

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`${basePath}/tasks/${task.id}`}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight line-clamp-1"
          >
            {task.title}
          </Link>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}

        <div className="pt-2 text-xs text-slate-500 space-y-1 border-t border-slate-100">
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Project:</span>
            <span className="text-slate-900 font-semibold">{projectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Assigned To:</span>
            <span>{developerName}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onStatusChange ? (
            <TaskStatusSelect
              status={task.status}
              onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
            />
          ) : (
            <StatusBadge status={task.status} />
          )}

          <OverdueBadge dueDate={task.dueDate} isOverdue={task.isOverdue} />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`${basePath}/tasks/${task.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View
          </Link>

          {canEditDetails && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              Edit
            </button>
          )}

          {canEditDetails && onDelete && (
            <button
              onClick={() => onDelete(task)}
              className="px-2 py-0.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200 transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
