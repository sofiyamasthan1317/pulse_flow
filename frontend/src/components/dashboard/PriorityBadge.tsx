import type { TaskPriority } from "../../types/task";

type PriorityBadgeProps = {
  priority: TaskPriority;
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const getPriorityConfig = (pr: TaskPriority) => {
    switch (pr) {
      case "LOW":
        return { label: "Low", style: "bg-slate-100 text-slate-600 border-slate-200" };
      case "MEDIUM":
        return { label: "Medium", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "HIGH":
        return { label: "High", style: "bg-orange-50 text-orange-700 border-orange-200" };
      case "CRITICAL":
        return { label: "Critical", style: "bg-red-50 text-red-700 border-red-200" };
      default:
        return { label: pr, style: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.style}`}
    >
      {config.label}
    </span>
  );
};
