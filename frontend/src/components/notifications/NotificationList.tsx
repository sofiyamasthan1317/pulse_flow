import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

export const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (isLoading) return <LoadingSpinner message="Loading notifications..." />;

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-200 text-center space-y-3" role="alert">
        <p className="text-sm text-red-600">Unable to load notifications.</p>
        <button
          onClick={() => void fetchNotifications()}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mark-all-read action */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => void markAllAsRead()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div
            className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">You&apos;re all caught up!</h3>
          <p className="text-sm text-slate-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Notifications">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
