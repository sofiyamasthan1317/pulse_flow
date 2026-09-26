import type { UpcomingTask } from "../../types/dashboard";
import { OverdueBadge } from "./OverdueBadge";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

type UpcomingTasksProps = {
  tasks: UpcomingTask[];
};

export const UpcomingTasks = ({ tasks }: UpcomingTasksProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Upcoming Due Tasks This Week</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">No upcoming tasks this week.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 text-sm">{task.title}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{task.project?.name || "Project"}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <OverdueBadge dueDate={task.dueDate} isOverdue={task.isOverdue} />
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

