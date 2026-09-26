import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tasksApi } from "../../api/tasks.api";
import { activitiesApi } from "../../api/activities.api";
import { ActivityItem } from "../../components/activity/ActivityItem";
import { ActivitySkeleton } from "../../components/activity/ActivitySkeleton";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { OverdueBadge } from "../../components/dashboard/OverdueBadge";
import { PriorityBadge } from "../../components/dashboard/PriorityBadge";
import { TaskStatusSelect } from "../../components/tasks/TaskStatusSelect";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../store/auth.store";
import type { ActivityLog } from "../../types/activity";
import type { Task, TaskStatus } from "../../types/task";
import { extractErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/formatDate";

type TaskDetailsPageProps = {
  basePath: string;
};

export const TaskDetailsPage = ({ basePath }: TaskDetailsPageProps) => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const { latestActivity, joinProject, leaveProject, isConnected } = useSocket();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Activity for this task's project — backend scopes by role
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;
    setIsLoading(true);

    tasksApi
      .getTaskById(taskId)
      .then((data) => {
        if (!isMounted) return;
        setTask(data);
        setIsLoading(false);

        // Fetch activity for this task's project once we have the projectId
        if (data.projectId) {
          setIsActivityLoading(true);
          activitiesApi
            .getProjectActivities(data.projectId)
            .then((logs) => {
              if (!isMounted) return;
              setActivities(logs.filter((a) => a.taskId === data.id));
            })
            .catch(() => {
              // Non-critical: activity section silently fails
            })
            .finally(() => {
              if (isMounted) setIsActivityLoading(false);
            });
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
  }, [taskId]);

  // Join/leave project room
  useEffect(() => {
    if (!task?.projectId || !isConnected) return;

    void joinProject(task.projectId);

    return () => {
      leaveProject(task.projectId);
    };
  }, [task?.projectId, isConnected, joinProject, leaveProject]);

  // Real-time socket updates for status and activity logs
  useEffect(() => {
    if (!latestActivity || !task) return;
    if (latestActivity.taskId !== task.id) return;

    // Update task status in real-time if changed
    if (latestActivity.newStatus && latestActivity.newStatus !== task.status) {
      setTask((prev) => (prev ? { ...prev, status: latestActivity.newStatus as TaskStatus } : prev));
    }

    // Prepend activity log
    setActivities((prev) => {
      if (prev.some((a) => a.id === latestActivity.id)) return prev;

      const newLog: ActivityLog = {
        id: latestActivity.id,
        taskId: latestActivity.taskId,
        projectId: latestActivity.projectId,
        userId: latestActivity.actor.id,
        previousStatus: (latestActivity.previousStatus || latestActivity.oldStatus) as TaskStatus | null,
        newStatus: latestActivity.newStatus as TaskStatus,
        message: latestActivity.message,
        createdAt:
          typeof latestActivity.createdAt === "string"
            ? latestActivity.createdAt
            : new Date(latestActivity.createdAt).toISOString(),
        user: {
          id: latestActivity.actor.id,
          name: latestActivity.actor.name,
          email: "",
        },
      };

      return [newLog, ...prev];
    });
  }, [latestActivity, task]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    const updated = await tasksApi.updateTask(task.id, { status: newStatus });
    setTask(updated);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="bg-white p-8 rounded-xl border border-red-200 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900">Task Not Found</h3>
        <p className="text-sm text-red-600">{error || "Unable to load task."}</p>
        <Link
          to={`${basePath}/tasks`}
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Back to Tasks
        </Link>
      </div>
    );
  }

  const developerName =
    task.assignedDeveloper?.name || task.assignedDeveloper?.email || "Unassigned";
  const projectName = task.project?.name || "Project";

  // Developers can only update status; admins and PMs can also see the status select
  const canChangeStatus =
    user?.role === "ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    (user?.role === "DEVELOPER" && task.assignedDeveloperId === user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb / back link */}
      <div>
        <Link
          to={`${basePath}/tasks`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 mb-2"
        >
          ← Back to Tasks
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <OverdueBadge dueDate={task.dueDate} isOverdue={task.isOverdue} />
          </div>
        </div>
      </div>

      {/* Task Details Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div>
            <span className="font-medium text-slate-500 block text-xs">Project</span>
            <span className="font-semibold text-slate-900">{projectName}</span>
          </div>

          <div>
            <span className="font-medium text-slate-500 block text-xs">Assigned Developer</span>
            <span className="font-semibold text-slate-900">{developerName}</span>
          </div>

          <div>
            <span className="font-medium text-slate-500 block text-xs mb-1">Current Status</span>
            {canChangeStatus ? (
              <TaskStatusSelect status={task.status} onStatusChange={handleStatusChange} />
            ) : (
              <span className="font-semibold text-slate-900">{task.status.replace(/_/g, " ")}</span>
            )}
          </div>

          <div>
            <span className="font-medium text-slate-500 block text-xs">Created Date</span>
            <span className="font-semibold text-slate-900">{formatDate(task.createdAt)}</span>
          </div>

          {task.dueDate && (
            <div>
              <span className="font-medium text-slate-500 block text-xs">Due Date</span>
              <span className="font-semibold text-slate-900">{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Activity</h2>

        {isActivityLoading ? (
          <ActivitySkeleton rows={3} />
        ) : activities.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
            <p className="text-sm text-slate-500">No activity recorded for this task yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            {activities.map((activity, idx) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={idx === activities.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
