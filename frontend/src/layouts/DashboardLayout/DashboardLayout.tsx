type DashboardLayoutProps = {
  children?: React.ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="flex min-h-screen bg-slate-100">
    <aside className="w-64 border-r border-slate-200 bg-slate-900 p-4 text-white">Sidebar</aside>
    <div className="flex-1">
      <header className="border-b border-slate-200 bg-white px-6 py-4">Header</header>
      <main className="p-6">{children}</main>
    </div>
  </div>
);
