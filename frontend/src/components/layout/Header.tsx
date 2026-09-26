import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../store/auth.store";
import { NotificationBell } from "../notifications/NotificationBell";
import { useSocket } from "../../hooks/useSocket";

type HeaderProps = {
  onToggleSidebar?: () => void;
};

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email || "User";
  const displayRole = user?.role ? user.role.replace(/_/g, " ") : "";

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close user dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };
    if (isUserMenuOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isUserMenuOpen]);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "PROJECT_MANAGER":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DEVELOPER":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <header className="h-16 bg-[#0e0c1f]/95 backdrop-blur-md border-b border-violet-900/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-lg shadow-violet-950/20 transition-colors duration-200">
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/10 md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent tracking-tight select-none">
          PulseFlow
        </span>
      </div>

      {/* Right: socket live indicator + notification bell + user menu */}
      {user && (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Socket Connection Live Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20"
            title={isConnected ? "Real-time connection active" : "Reconnecting to real-time service..."}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className={isConnected ? "text-emerald-300" : "text-amber-400"}>
              {isConnected ? "Live" : "Connecting..."}
            </span>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User account menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="user-menu-btn"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs" aria-hidden="true">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">{displayName}</div>
                <div className="text-xs text-slate-300 capitalize">{displayRole.toLowerCase()}</div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-300 transition-transform hidden sm:block ${isUserMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                aria-labelledby="user-menu-btn"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      void logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
