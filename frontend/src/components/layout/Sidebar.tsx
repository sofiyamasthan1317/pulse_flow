import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth.store";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const iconSize = "w-5 h-5 shrink-0";

const icons = {
  dashboard: (
    <svg className={`${iconSize} text-indigo-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  projects: (
    <svg className={`${iconSize} text-sky-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  tasks: (
    <svg className={`${iconSize} text-emerald-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  users: (
    <svg className={`${iconSize} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  activity: (
    <svg className={`${iconSize} text-rose-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notifications: (
    <svg className={`${iconSize} text-amber-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user } = useAuth();

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case "ADMIN":
        return [
          { label: "Dashboard", path: "/admin/dashboard", icon: icons.dashboard },
          { label: "Projects", path: "/admin/projects", icon: icons.projects },
          { label: "Tasks", path: "/admin/tasks", icon: icons.tasks },
          { label: "Users", path: "/admin/users", icon: icons.users },
          { label: "Activity", path: "/admin/activity", icon: icons.activity },
          { label: "Notifications", path: "/admin/notifications", icon: icons.notifications },
        ];
      case "PROJECT_MANAGER":
        return [
          { label: "Dashboard", path: "/project-manager/dashboard", icon: icons.dashboard },
          { label: "My Projects", path: "/project-manager/projects", icon: icons.projects },
          { label: "Tasks", path: "/project-manager/tasks", icon: icons.tasks },
          { label: "Activity", path: "/project-manager/activity", icon: icons.activity },
          { label: "Notifications", path: "/project-manager/notifications", icon: icons.notifications },
        ];
      case "DEVELOPER":
        return [
          { label: "Dashboard", path: "/developer/dashboard", icon: icons.dashboard },
          { label: "My Tasks", path: "/developer/tasks", icon: icons.tasks },
          { label: "Activity", path: "/developer/activity", icon: icons.activity },
          { label: "Notifications", path: "/developer/notifications", icon: icons.notifications },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const displayName = user?.name || user?.email || "User";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - Unique Obsidian Violet Palette */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0e0c1f] text-slate-300 flex flex-col shrink-0 border-r border-violet-950/40 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-violet-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
                  PulseFlow
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5">
          <p className="text-[10px] font-bold text-violet-300/60 uppercase tracking-widest px-3 mb-3">
            Navigation Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 border-l-4 border-cyan-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer - user info */}
        <div className="px-3.5 py-4 border-t border-violet-900/30">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-violet-600/30 border border-violet-500/40 text-white"
                  : "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300"
              }`
            }
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-500/20 shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] font-medium text-violet-300/70 capitalize truncate">
                {user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

