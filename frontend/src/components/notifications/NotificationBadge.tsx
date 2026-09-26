type NotificationBadgeProps = {
  count: number;
};

/**
 * Small numeric badge displayed over the notification bell.
 * Hidden when count is 0.
 */
export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread notification${count !== 1 ? "s" : ""}`}
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};
