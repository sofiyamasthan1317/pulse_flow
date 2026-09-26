import type { TaskStatus } from "../../types/task";

type StatusBreakdownProps = {
  tasksByStatus: Record<TaskStatus, number>;
};

export const StatusBreakdown = ({ tasksByStatus }: StatusBreakdownProps) => {
  const total = Object.values(tasksByStatus).reduce((acc, count) => acc + count, 0);

  const statusItems: Array<{ key: TaskStatus; label: string; count: number; color: string }> = [
    { key: "TODO", label: "To Do", count: tasksByStatus.TODO ?? 0, color: "bg-slate-400" },
    { key: "IN_PROGRESS", label: "In Progress", count: tasksByStatus.IN_PROGRESS ?? 0, color: "bg-indigo-600" },
    { key: "IN_REVIEW", label: "In Review", count: tasksByStatus.IN_REVIEW ?? 0, color: "bg-amber-500" },
    { key: "DONE", label: "Done", count: tasksByStatus.DONE ?? 0, color: "bg-emerald-600" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900">Tasks by Status</h3>

      {total === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No tasks available.</p>
      ) : (
        <div className="space-y-4">
          {statusItems.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">
                    {item.count}{" "}
                    <span className="text-xs font-medium text-slate-500">
                      ({percentage}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${item.color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

