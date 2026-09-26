export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]" role="status">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
};
