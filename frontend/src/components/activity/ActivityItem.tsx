import type { ActivityLog } from "../../types/activity";
import { timeAgo } from "../../utils/timeAgo";

type ActivityItemProps = {
  activity: ActivityLog;
  /** When true, removes the vertical connector line (last item) */
  isLast?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_COLOR: Record<string, string> = {
  TODO: "text-slate-600 bg-slate-100",
  IN_PROGRESS: "text-blue-700 bg-blue-100",
  IN_REVIEW: "text-amber-700 bg-amber-100",
  DONE: "text-emerald-700 bg-emerald-100",
};

const StatusChip = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      STATUS_COLOR[status] ?? "text-slate-600 bg-slate-100"
    }`}
  >
    {STATUS_LABEL[status] ?? status}
  </span>
);

export const ActivityItem = ({ activity, isLast = false }: ActivityItemProps) => {
  const actorName = activity.user?.name || activity.user?.email || "Unknown";
  const taskTitle = activity.task?.title;
  const from = activity.previousStatus ?? null;
  const to = activity.newStatus;

  // Build a structured description from backend fields.
  // Fall back to the backend-provided message string if fields are sparse.
  const renderDescription = () => {
    if (from) {
      return (
        <>
          moved{" "}
          {taskTitle && (
            <>
              <span className="font-medium text-slate-800">&ldquo;{taskTitle}&rdquo;</span>{" "}
            </>
          )}
          from <StatusChip status={from} /> to <StatusChip status={to} />
        </>
      );
    }

    // No previousStatus — use backend message if available, otherwise generic fallback
    if (activity.message) {
      return <span className="text-slate-700">{activity.message}</span>;
    }

    return (
      <>
        updated{" "}
        {taskTitle && (
          <>
            <span className="font-medium text-slate-800">&ldquo;{taskTitle}&rdquo;</span>{" "}
          </>
        )}
        to <StatusChip status={to} />
      </>
    );
  };

  return (
    <div className="flex items-start gap-4">
      {/* Avatar + timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm select-none"
          aria-hidden="true"
        >
          {actorName.charAt(0).toUpperCase()}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-2 min-h-[20px]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
        <p className="text-sm text-slate-700 leading-snug flex flex-wrap items-center gap-1">
          <span className="font-semibold text-slate-900">{actorName}</span>{" "}
          {renderDescription()}
        </p>
        <time
          dateTime={activity.createdAt}
          className="text-xs text-slate-400 mt-1 block"
          title={new Date(activity.createdAt).toLocaleString()}
        >
          {timeAgo(activity.createdAt)}
        </time>
      </div>
    </div>
  );
};
