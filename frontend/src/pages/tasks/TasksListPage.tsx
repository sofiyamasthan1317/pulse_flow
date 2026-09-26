import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { projectsApi } from "../../api/projects.api";
import { tasksApi } from "../../api/tasks.api";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskDeleteDialog } from "../../components/tasks/TaskDeleteDialog";
import { TaskFilters } from "../../components/tasks/TaskFilters";
import { TaskFormModal } from "../../components/tasks/TaskFormModal";
import { useAuth } from "../../store/auth.store";
import type { Project } from "../../types/project";
import type { CreateTaskInput, Task, TaskQueryFilters, TaskStatus, UpdateTaskInput } from "../../types/task";
import { extractErrorMessage } from "../../utils/errors";

type TasksListPageProps = {
  basePath: string;
};

export const TasksListPage = ({ basePath }: TasksListPageProps) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isTaskDeleteDialogOpen, setIsTaskDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const filters: TaskQueryFilters = {
    status: (searchParams.get("status") as TaskQueryFilters["status"]) || undefined,
    priority: (searchParams.get("priority") as TaskQueryFilters["priority"]) || undefined,
    dueFrom: searchParams.get("dueFrom") || undefined,
    dueTo: searchParams.get("dueTo") || undefined,
  };

  // Initial load: fetch projects available to user
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    projectsApi
      .listProjects()
      .then((projList) => {
        if (!isMounted) return;
        setProjects(projList);
        if (projList.length > 0) {
          setSelectedProjectId(projList[0].id);
        } else {
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
  }, []);

  // Fetch tasks whenever selected project or filters change
  useEffect(() => {
    if (!selectedProjectId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    projectsApi
      .listTasksForProject(selectedProjectId, filters)
      .then((taskList) => {
        if (isMounted) {
          setTasks(taskList);
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
  }, [selectedProjectId, searchParams.toString()]);

  const handleTaskSubmit = async (input: CreateTaskInput | UpdateTaskInput) => {
    if (taskToEdit) {
      const updated = await tasksApi.updateTask(taskToEdit.id, input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else if (selectedProjectId) {
      const created = await projectsApi.createTaskForProject(selectedProjectId, input as CreateTaskInput);
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

  const canCreateTask = (user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER") && selectedProjectId;
  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.dueFrom || filters.dueTo);

  // Extract known developers from current tasks
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, filter, and track task progress</p>
        </div>

        {canCreateTask && (
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

      {/* Project Selector (if user has multiple accessible projects) */}
      {projects.length > 1 && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <label htmlFor="projectSelect" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Select Project:
          </label>
          <select
            id="projectSelect"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filters */}
      <TaskFilters />

      {/* Task List Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : error ? (
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center space-y-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {hasActiveFilters ? "No tasks match your current filters." : "No tasks found."}
          </h3>
          <p className="text-sm text-slate-500">
            {hasActiveFilters
              ? "Try adjusting or clearing your filter criteria."
              : user?.role === "DEVELOPER"
              ? "You currently have no assigned tasks."
              : "Create a task to get started."}
          </p>
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
