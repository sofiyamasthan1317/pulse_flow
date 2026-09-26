type TaskPriorityBadgeProps = {
  priority?: string;
};

export const TaskPriorityBadge = ({ priority = "Medium" }: TaskPriorityBadgeProps) => (
  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{priority}</span>
);
