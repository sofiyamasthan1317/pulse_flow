/** Skeleton shimmer row for activity feed loading state */
const ShimmerRow = ({ wide = false }: { wide?: boolean }) => (
  <div className="flex items-start gap-4">
    <div className="shrink-0">
      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
    </div>
    <div className="flex-1 space-y-2 pb-6">
      <div className={`h-3 rounded bg-slate-200 animate-pulse ${wide ? "w-3/4" : "w-1/2"}`} />
      <div className="h-2 rounded bg-slate-100 animate-pulse w-1/4" />
    </div>
  </div>
);

type ActivitySkeletonProps = {
  rows?: number;
};

export const ActivitySkeleton = ({ rows = 5 }: ActivitySkeletonProps) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-0" aria-busy="true" aria-label="Loading activity">
    {Array.from({ length: rows }).map((_, i) => (
      <ShimmerRow key={i} wide={i % 2 === 0} />
    ))}
  </div>
);
