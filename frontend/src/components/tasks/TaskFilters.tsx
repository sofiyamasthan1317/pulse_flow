import { useSearchParams } from "react-router-dom";

export const TaskFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get("status") || "";
  const currentPriority = searchParams.get("priority") || "";
  const currentDueFrom = searchParams.get("dueFrom") || "";
  const currentDueTo = searchParams.get("dueTo") || "";

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentStatus || currentPriority || currentDueFrom || currentDueTo);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <div className="flex flex-col min-w-[130px]">
        <label htmlFor="filterStatus" className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
          Status
        </label>
        <select
          id="filterStatus"
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-col min-w-[130px]">
        <label htmlFor="filterPriority" className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
          Priority
        </label>
        <select
          id="filterPriority"
          value={currentPriority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Due From */}
      <div className="flex flex-col">
        <label htmlFor="filterDueFrom" className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
          Due From
        </label>
        <input
          id="filterDueFrom"
          type="date"
          value={currentDueFrom}
          onChange={(e) => updateFilter("dueFrom", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Due To */}
      <div className="flex flex-col">
        <label htmlFor="filterDueTo" className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
          Due To
        </label>
        <input
          id="filterDueTo"
          type="date"
          value={currentDueTo}
          onChange={(e) => updateFilter("dueTo", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex flex-col justify-end self-end">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
