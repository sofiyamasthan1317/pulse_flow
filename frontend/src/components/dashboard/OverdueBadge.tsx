import { formatDate } from "../../utils/formatDate";

type OverdueBadgeProps = {
  dueDate?: string | null;
  isOverdue?: boolean;
};

export const OverdueBadge = ({ dueDate, isOverdue }: OverdueBadgeProps) => {
  if (!dueDate && !isOverdue) {
    return null;
  }

  const formattedDate = dueDate ? formatDate(dueDate) : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {formattedDate && (
        <span className="text-slate-500 font-medium">Due: {formattedDate}</span>
      )}
      {isOverdue && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          Overdue
        </span>
      )}
    </div>
  );
};
