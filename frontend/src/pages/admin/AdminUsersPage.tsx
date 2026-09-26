import { useEffect, useState } from "react";
import { projectsApi } from "../../api/projects.api";
import { PresenceIndicator } from "../../components/common/PresenceIndicator";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../store/auth.store";
import type { Project } from "../../types/project";
import { extractErrorMessage } from "../../utils/errors";

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();


  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    projectsApi
      .listProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading user directory..." />;
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-200 text-center space-y-3" role="alert">
        <p className="text-sm text-red-600">Unable to load users.</p>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  // Extract unique team members across projects
  const teamMap = new Map<string, { id: string; name: string; email: string; role: string }>();

  // Add current user
  if (currentUser) {
    teamMap.set(currentUser.id, {
      id: currentUser.id,
      name: currentUser.name || "Admin",
      email: currentUser.email,
      role: currentUser.role,
    });
  }

  // Add project creators & clients
  projects.forEach((p) => {
    if (p.creator) {
      teamMap.set(p.creator.id, {
        id: p.creator.id,
        name: p.creator.name || p.creator.email,
        email: p.creator.email,
        role: "PROJECT_MANAGER",
      });
    }
  });

  const users = Array.from(teamMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Real-Time Presence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor system users and live online status via Socket.io
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">User Directory</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Presence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {u.name} {u.id === currentUser?.id ? "(You)" : ""}
                          </div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PresenceIndicator userId={u.id} showText={true} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
