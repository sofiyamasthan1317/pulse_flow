import type { TaskStatus } from "../../types/task";

type StatusBadgeProps = {
  status: TaskStatus;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (st: TaskStatus) => {
    switch (st) {
      case "TODO":
        return { label: "To Do", style: "bg-slate-100 text-slate-700 border-slate-200" };
      case "IN_PROGRESS":
        return { label: "In Progress", style: "bg-blue-50 text-blue-700 border-blue-200" };
      case "IN_REVIEW":
        return { label: "In Review", style: "bg-amber-50 text-amber-700 border-amber-200" };
      case "DONE":
        return { label: "Done", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { label: st, style: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.style}`}
    >
      {config.label}
    </span>
  );
};
