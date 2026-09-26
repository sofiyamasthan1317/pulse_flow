import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboard.api";
import { DashboardErrorState } from "../../components/dashboard/DashboardErrorState";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { PriorityBreakdown } from "../../components/dashboard/PriorityBreakdown";
import { StatCard } from "../../components/dashboard/StatCard";
import { UpcomingTasks } from "../../components/dashboard/UpcomingTasks";
import { useAuth } from "../../store/auth.store";
import type { ProjectManagerDashboardData } from "../../types/dashboard";
import { extractErrorMessage } from "../../utils/errors";

export const PMDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ProjectManagerDashboardData | null>(null);
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
      const result = await dashboardApi.getProjectManagerDashboard();
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
      .getProjectManagerDashboard()
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
        message={error || "Unable to load project manager dashboard data."}
        onRetry={() => void loadData(false)}
      />
    );
  }

  const displayName = user?.name || user?.email || "Project Manager";

  return (
    <DashboardSection
      title="Project Manager Dashboard"
      subtitle={`Welcome back, ${displayName}`}
      onRefresh={() => void loadData(true)}
      isRefreshing={isRefreshing}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Projects"
          value={data.totalProjects}
          variant="primary"
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Total Project Tasks"
          value={data.totalTasks}
          variant="default"
          icon={
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Upcoming Due This Week"
          value={data.upcomingDueTasks.length}
          variant={data.upcomingDueTasks.length > 0 ? "primary" : "default"}
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid: Upcoming Tasks & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingTasks tasks={data.upcomingDueTasks} />
        </div>

        <div>
          <PriorityBreakdown tasksByPriority={data.tasksByPriority} />
        </div>
      </div>
    </DashboardSection>
  );
};
