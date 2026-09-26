import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboard.api";
import { DashboardErrorState } from "../../components/dashboard/DashboardErrorState";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { OverdueBadge } from "../../components/dashboard/OverdueBadge";
import { PriorityBadge } from "../../components/dashboard/PriorityBadge";
import { StatCard } from "../../components/dashboard/StatCard";
import { StatusBadge } from "../../components/dashboard/StatusBadge";
import { useAuth } from "../../store/auth.store";
import type { DeveloperDashboardData } from "../../types/dashboard";
import { extractErrorMessage } from "../../utils/errors";

export const DeveloperDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DeveloperDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await dashboardApi.getDeveloperDashboard();
      setData(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    dashboardApi
      .getDeveloperDashboard()
      .then((result) => {
        if (isSubscribed) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setError(extractErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        message={error || "Unable to load developer dashboard data."}
        onRetry={() => void loadData(false)}
      />
    );
  }

  const displayName = user?.name || user?.email || "Developer";
  const inProgressCount = data.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueCount = data.tasks.filter((t) => t.isOverdue).length;

  return (
    <DashboardSection
      title="Developer Dashboard"
      subtitle={`Welcome back, ${displayName}`}
      onRefresh={() => void loadData(true)}
      isRefreshing={isRefreshing}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Tasks"
          value={data.totalAssignedTasks}
          variant="primary"
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          variant="default"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          variant={overdueCount > 0 ? "danger" : "default"}
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">My Assigned Tasks</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Sorted by Priority & Due Date
          </span>
        </div>

        {data.tasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No assigned tasks.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.tasks.map((task) => (
              <div
                key={task.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{task.title}</div>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{task.project?.name || "Project"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <OverdueBadge dueDate={task.dueDate} isOverdue={task.isOverdue} />
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardSection>
  );
};
