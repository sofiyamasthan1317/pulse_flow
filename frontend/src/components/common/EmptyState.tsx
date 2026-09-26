type EmptyStateProps = {
  title?: string;
  description?: string;
};

export const EmptyState = ({
  title = "No records found",
  description = "There is nothing to display yet.",
}: EmptyStateProps) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
  </div>
);
