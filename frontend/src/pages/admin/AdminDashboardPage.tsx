import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboard.api";
import { DashboardErrorState } from "../../components/dashboard/DashboardErrorState";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { StatCard } from "../../components/dashboard/StatCard";
import { StatusBreakdown } from "../../components/dashboard/StatusBreakdown";
import { PresenceIndicator } from "../../components/common/PresenceIndicator";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../store/auth.store";
import type { AdminDashboardData } from "../../types/dashboard";
import { extractErrorMessage } from "../../utils/errors";

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { onlineUsers, isConnected, latestActivity } = useSocket();
  const [data, setData] = useState<AdminDashboardData | null>(null);
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
      const result = await dashboardApi.getAdminDashboard();
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
      .getAdminDashboard()
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

  // Soft refresh dashboard metrics when a task status activity occurs in real-time
  useEffect(() => {
    if (latestActivity) {
      void loadData(true);
    }
  }, [latestActivity]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        message={error || "Unable to load admin dashboard data."}
        onRetry={() => void loadData(false)}
      />
    );
  }

  const totalTasks = Object.values(data.tasksByStatus).reduce((acc, count) => acc + count, 0);
  const displayName = user?.name || user?.email || "Admin";

  const onlineUserIds = Object.keys(onlineUsers).filter((id) => onlineUsers[id]);

  return (
    <DashboardSection
      title="Admin Dashboard"
      subtitle={`Welcome back, ${displayName}`}
      onRefresh={() => void loadData(true)}
      isRefreshing={isRefreshing}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={data.totalProjects}
          variant="primary"
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          variant="default"
          icon={
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Overdue Tasks"
          value={data.overdueTasks}
          variant="danger"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid: Status Breakdown & Real-Time Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatusBreakdown tasksByStatus={data.tasksByStatus} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Online Users</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {onlineUserIds.length} online
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Socket Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <PresenceIndicator isOnline={isConnected} />
                <span className={isConnected ? "text-emerald-700" : "text-amber-600"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </span>
            </div>

            {onlineUserIds.length === 0 ? (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                No other users currently connected to Socket.io.
              </p>
            ) : (
              <div className="pt-2 border-t border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                {onlineUserIds.map((userId) => (
                  <div key={userId} className="flex items-center justify-between text-xs py-1">
                    <span className="font-mono text-slate-600 truncate max-w-[160px]">
                      {userId === user?.id ? `${user.name} (You)` : `User ${userId.slice(0, 8)}...`}
                    </span>
                    <PresenceIndicator isOnline={true} showText={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
};
