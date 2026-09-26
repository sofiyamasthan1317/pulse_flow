export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-md"></div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-28 bg-slate-200 rounded-xl"></div>
        <div className="h-28 bg-slate-200 rounded-xl"></div>
        <div className="h-28 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-200 rounded-xl"></div>
        <div className="h-72 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};
