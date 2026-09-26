import { useState } from "react";
import type { TaskStatus } from "../../types/task";

type TaskStatusSelectProps = {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => Promise<void>;
  disabled?: boolean;
};

export const TaskStatusSelect = ({
  status,
  onStatusChange,
  disabled = false,
}: TaskStatusSelectProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } catch {
      // Parent component handles error messaging; status remains current status on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={handleChange}
        disabled={disabled || isUpdating}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 transition-colors"
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </select>
      {isUpdating && (
        <span className="ml-1 text-[10px] text-slate-400 font-normal">Saving...</span>
      )}
    </div>
  );
};
