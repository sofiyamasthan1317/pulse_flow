import { useEffect, useState } from "react";
import { projectsApi } from "../../api/projects.api";
import { ActivityFeed } from "../../components/activity/ActivityFeed";
import { ActivitySkeleton } from "../../components/activity/ActivitySkeleton";
import type { Project } from "../../types/project";
import { useAuth } from "../../store/auth.store";
import { extractErrorMessage } from "../../utils/errors";

export const ActivityPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    projectsApi
      .listProjects()
      .then((data) => {
        if (!isMounted) return;
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch((err) => {
        if (isMounted) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const roleDescription =
    user?.role === "DEVELOPER"
      ? "Track status changes on your assigned tasks"
      : "Track task status changes across your projects";

  const emptyProjectMessage =
    user?.role === "DEVELOPER"
      ? "You have no projects with assigned tasks yet."
      : "Activity logs will appear once you have projects with tasks.";

  const feedEmptyMessage =
    user?.role === "DEVELOPER"
      ? "No activity for your assigned tasks yet."
      : "Activity will appear here when tasks are updated.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity</h1>
        <p className="text-sm text-slate-500 mt-1">{roleDescription}</p>
      </div>

      {isLoading ? (
        <ActivitySkeleton rows={5} />
      ) : error ? (
        <div className="bg-white p-6 rounded-xl border border-red-200 text-center space-y-3" role="alert">
          <p className="text-sm text-red-600">Unable to load activity.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">No activity yet.</h3>
          <p className="text-sm text-slate-500">{emptyProjectMessage}</p>
        </div>
      ) : (
        <>
          {/* Project selector — only shown when user has multiple accessible projects */}
          {projects.length > 1 && (
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <label
                htmlFor="activityProjectSelect"
                className="text-xs font-semibold text-slate-700 whitespace-nowrap"
              >
                Select Project:
              </label>
              <select
                id="activityProjectSelect"
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

          {selectedProjectId && (
            <ActivityFeed
              projectId={selectedProjectId}
              emptyMessage={feedEmptyMessage}
            />
          )}
        </>
      )}
    </div>
  );
};
