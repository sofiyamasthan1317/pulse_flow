import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth.store";
import type { Project } from "../../types/project";
import { formatDate } from "../../utils/formatDate";

type ProjectCardProps = {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  basePath: string;
};

export const ProjectCard = ({ project, onEdit, onDelete, basePath }: ProjectCardProps) => {
  const { user } = useAuth();

  const isOwner = user?.role === "ADMIN" || (user?.role === "PROJECT_MANAGER" && project.creatorId === user.id);
  const taskCount = Array.isArray(project.tasks) ? project.tasks.length : 0;
  const clientName = project.client?.name || project.clientId;
  const ownerName = project.creator?.name || project.creator?.email || "Unknown";

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`${basePath}/projects/${project.id}`}
            className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight line-clamp-1"
          >
            {project.name}
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
        )}

        <div className="pt-2 text-xs text-slate-500 space-y-1 border-t border-slate-100">
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Client:</span>
            <span className="text-slate-900 font-semibold">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Owner:</span>
            <span>{ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Created:</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`${basePath}/projects/${project.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
        >
          View Details &rarr;
        </Link>

        {isOwner && (onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project)}
                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200 transition-colors cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
