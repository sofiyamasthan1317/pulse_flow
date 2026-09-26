import { useAuth } from "../../store/auth.store";

const roleLabelMap: Record<string, string> = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
};

const roleBadgeColor: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  PROJECT_MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  DEVELOPER: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.name || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = roleLabelMap[user.role] || user.role;
  const badgeClass = roleBadgeColor[user.role] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your account information</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
          {initials}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div>
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}
            >
              {roleLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <span className="text-xs font-medium text-slate-400 block">User ID</span>
              <span className="font-mono text-xs text-slate-700 break-all">{user.id}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Account Status</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
