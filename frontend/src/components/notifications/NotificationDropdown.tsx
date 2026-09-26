import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth.store";
import type { UseNotificationsReturn } from "../../hooks/useNotifications";
import type { Notification } from "../../types/notification";
import { NotificationItem } from "./NotificationItem";

type NotificationDropdownProps = Pick<
  UseNotificationsReturn,
  "notifications" | "unreadCount" | "isLoading" | "markAsRead" | "markAllAsRead"
> & {
  onClose: () => void;
};

/** Derive the notifications page route from the current user's role */
const useNotificationsRoute = (): string => {
  const { user } = useAuth();
  switch (user?.role) {
    case "ADMIN":
      return "/admin/notifications";
    case "PROJECT_MANAGER":
      return "/project-manager/notifications";
    case "DEVELOPER":
      return "/developer/notifications";
    default:
      return "/notifications";
  }
};

const MAX_DROPDOWN_ITEMS = 6;

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  isLoading,
  markAsRead,
  markAllAsRead,
  onClose,
}: NotificationDropdownProps) => {
  const notifRoute = useNotificationsRoute();

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    // Keep dropdown open so user can see the state change
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const recent: Notification[] = notifications.slice(0, MAX_DROPDOWN_ITEMS);

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden max-h-[calc(100vh-80px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => void handleMarkAll()}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1" role="list">
        {isLoading ? (
          <div className="px-4 py-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 animate-pulse rounded w-4/5" />
                  <div className="h-2 bg-slate-100 animate-pulse rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-700">You&apos;re all caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 bg-slate-50">
        <Link
          to={notifRoute}
          onClick={onClose}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
};
