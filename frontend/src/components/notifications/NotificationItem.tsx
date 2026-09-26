import type { Notification } from "../../types/notification";
import { timeAgo } from "../../utils/timeAgo";

type NotificationItemProps = {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  /** Compact mode for dropdown — less padding, no mark-read button */
  compact?: boolean;
};

export const NotificationItem = ({
  notification,
  onMarkRead,
  compact = false,
}: NotificationItemProps) => {
  const isUnread = !notification.isRead;

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      role="listitem"
      onClick={handleClick}
      className={`flex items-start gap-3 transition-colors rounded-lg
        ${compact ? "px-4 py-3" : "px-4 py-4 rounded-xl border shadow-xs"}
        ${isUnread
          ? "bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100"
          : "bg-white border-slate-200"
        }
      `}
    >
      {/* Unread indicator dot — accessible via aria-label on parent, not color alone */}
      <div className="mt-1 shrink-0" aria-hidden="true">
        <span
          className={`block w-2 h-2 rounded-full ${
            isUnread ? "bg-indigo-500" : "bg-transparent border border-slate-300"
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words ${
            isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-600"
          }`}
        >
          {notification.message}
        </p>
        <time
          dateTime={notification.createdAt}
          className="text-xs text-slate-400 mt-1 block"
          title={new Date(notification.createdAt).toLocaleString()}
        >
          {timeAgo(notification.createdAt)}
        </time>
      </div>

      {/* Explicit mark-read button — only on full-page view */}
      {!compact && isUnread && onMarkRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          aria-label="Mark as read"
          className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer py-0.5 px-1 rounded"
        >
          Mark read
        </button>
      )}
    </div>
  );
};
