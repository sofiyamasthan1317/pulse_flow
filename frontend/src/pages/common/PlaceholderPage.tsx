export const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <p className="text-slate-600 font-medium">{title}</p>
        <p className="text-slate-500 text-sm mt-1">
          This feature will be implemented in a later phase.
        </p>
      </div>
    </div>
  );
};
