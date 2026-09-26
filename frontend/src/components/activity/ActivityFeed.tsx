import { useEffect, useState } from "react";
import { activitiesApi } from "../../api/activities.api";
import { useSocket } from "../../hooks/useSocket";
import type { ActivityLog } from "../../types/activity";
import type { TaskStatus } from "../../types/task";
import { extractErrorMessage } from "../../utils/errors";
import { ActivityItem } from "./ActivityItem";
import { ActivitySkeleton } from "./ActivitySkeleton";

type ActivityFeedProps = {
  projectId: string;
  /** Role-aware empty-state message override */
  emptyMessage?: string;
};

export const ActivityFeed = ({
  projectId,
  emptyMessage = "Activity will appear here when tasks are updated.",
}: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    latestActivity,
    missedActivities,
    clearMissedActivities,
    joinProject,
    leaveProject,
    isConnected,
  } = useSocket();

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await activitiesApi.getProjectActivities(projectId);
      setActivities(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    void fetchActivities();
  }, [projectId]);

  // Join/leave project socket room
  useEffect(() => {
    if (!projectId || !isConnected) return;

    void joinProject(projectId);

    return () => {
      leaveProject(projectId);
    };
  }, [projectId, isConnected, joinProject, leaveProject]);

  // Handle incoming real-time activity event
  useEffect(() => {
    if (!latestActivity) return;
    if (latestActivity.projectId !== projectId) return;

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
  }, [latestActivity, projectId]);

  // Merge missed activities if any exist for this project
  const relevantMissed = missedActivities.filter(
    (m) => !projectId || m.projectId === projectId,
  );

  if (isLoading) return <ActivitySkeleton rows={5} />;

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-200 text-center space-y-3" role="alert">
        <p className="text-sm text-red-600">Unable to load activity.</p>
        <button
          onClick={() => void fetchActivities()}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relevantMissed.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-amber-600 text-lg">⚡</span>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Missed Activity
              </p>
              <p className="text-xs text-amber-700">
                You caught up on {relevantMissed.length} activity update{relevantMissed.length > 1 ? "s" : ""} while offline.
              </p>
            </div>
          </div>
          <button
            onClick={clearMissedActivities}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 px-2.5 py-1 bg-amber-100 rounded-lg cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">No activity yet.</h3>
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div>
            {activities.map((activity, idx) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={idx === activities.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
