import type { TaskPriority } from "../../types/task";

type PriorityBreakdownProps = {
  tasksByPriority: Record<TaskPriority, number>;
};

export const PriorityBreakdown = ({ tasksByPriority }: PriorityBreakdownProps) => {
  const total = Object.values(tasksByPriority).reduce((acc, count) => acc + count, 0);

  const priorityItems: Array<{ key: TaskPriority; label: string; count: number; color: string }> = [
    { key: "LOW", label: "Low", count: tasksByPriority.LOW ?? 0, color: "bg-cyan-500" },
    { key: "MEDIUM", label: "Medium", count: tasksByPriority.MEDIUM ?? 0, color: "bg-indigo-500" },
    { key: "HIGH", label: "High", count: tasksByPriority.HIGH ?? 0, color: "bg-amber-500" },
    { key: "CRITICAL", label: "Critical", count: tasksByPriority.CRITICAL ?? 0, color: "bg-rose-600" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900">Tasks by Priority</h3>

      {total === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No tasks available.</p>
      ) : (
        <div className="space-y-4">
          {priorityItems.map((item) => {
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

