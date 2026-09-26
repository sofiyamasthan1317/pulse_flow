import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projectsApi } from "../../api/projects.api";
import { tasksApi } from "../../api/tasks.api";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskDeleteDialog } from "../../components/tasks/TaskDeleteDialog";
import { TaskFilters } from "../../components/tasks/TaskFilters";
import { TaskFormModal } from "../../components/tasks/TaskFormModal";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../store/auth.store";
import type { Project } from "../../types/project";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../../types/task";
import { extractErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/formatDate";

type ProjectDetailsPageProps = {
  basePath: string;
};

export const ProjectDetailsPage = ({ basePath }: ProjectDetailsPageProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { latestActivity, joinProject, leaveProject, isConnected } = useSocket();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isTaskDeleteDialogOpen, setIsTaskDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      projectsApi.getProjectById(projectId),
      projectsApi.listTasksForProject(projectId),
    ])
      .then(([projData, taskData]) => {
        if (isMounted) {
          setProject(projData);
          setTasks(taskData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Join socket room for this project
  useEffect(() => {
    if (!projectId || !isConnected) return;

    void joinProject(projectId);

    return () => {
      leaveProject(projectId);
    };
  }, [projectId, isConnected, joinProject, leaveProject]);

  // Handle real-time task status updates via socket activities
  useEffect(() => {
    if (!latestActivity || !projectId) return;
    if (latestActivity.projectId !== projectId) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === latestActivity.taskId
          ? { ...t, status: latestActivity.newStatus as TaskStatus }
          : t,
      ),
    );
  }, [latestActivity, projectId]);

  const handleTaskSubmit = async (input: CreateTaskInput | UpdateTaskInput) => {
    if (!projectId) return;

    if (taskToEdit) {
      const updated = await tasksApi.updateTask(taskToEdit.id, input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await projectsApi.createTaskForProject(projectId, input as CreateTaskInput);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    await tasksApi.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const updated = await tasksApi.updateTask(taskId, { status: newStatus });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="bg-white p-8 rounded-xl border border-red-200 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900">Project Not Found</h3>
        <p className="text-sm text-red-600">{error || "Unable to load project."}</p>
        <Link
          to={`${basePath}/projects`}
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const isOwner = user?.role === "ADMIN" || (user?.role === "PROJECT_MANAGER" && project.creatorId === user.id);
  const clientName = project.client?.name || project.clientId;
  const ownerName = project.creator?.name || project.creator?.email || "Unknown";

  // Gather known developers from existing tasks for developer selection dropdown
  const knownDevelopers = Array.from(
    new Map(
      tasks
        .filter((t) => t.assignedDeveloper?.id)
        .map((t) => [
          t.assignedDeveloper!.id,
          { id: t.assignedDeveloper!.id, name: t.assignedDeveloper!.name, email: t.assignedDeveloper!.email },
        ]),
    ).values(),
  );

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          to={`${basePath}/projects`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 mb-2"
        >
          &larr; Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>

          {isOwner && (
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskFormOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {project.description && (
          <p className="text-sm text-slate-700">{project.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="font-medium text-slate-500 block">Client</span>
            <span className="font-semibold text-slate-900">{clientName}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500 block">Project Owner</span>
            <span className="font-semibold text-slate-900">{ownerName}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500 block">Created Date</span>
            <span className="font-semibold text-slate-900">{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Project Tasks</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <TaskFilters />

        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            No tasks found in this project.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                basePath={basePath}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsTaskFormOpen(true);
                }}
                onDelete={(t) => {
                  setTaskToDelete(t);
                  setIsTaskDeleteDialogOpen(true);
                }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isTaskFormOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        knownDevelopers={knownDevelopers}
      />

      {/* Task Delete Dialog */}
      <TaskDeleteDialog
        isOpen={isTaskDeleteDialogOpen}
        task={taskToDelete}
        onClose={() => setIsTaskDeleteDialogOpen(false)}
        onConfirm={handleTaskDelete}
      />
    </div>
  );
};
