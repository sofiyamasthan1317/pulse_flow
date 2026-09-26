type DropdownProps = {
  label: string;
  children?: React.ReactNode;
};

export const Dropdown = ({ label, children }: DropdownProps) => (
  <div className="relative inline-block">
    <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
      {label}
    </button>
    {children ? <div className="absolute right-0 mt-2 min-w-40 rounded-md border border-slate-200 bg-white p-2 shadow-lg">{children}</div> : null}
  </div>
);
