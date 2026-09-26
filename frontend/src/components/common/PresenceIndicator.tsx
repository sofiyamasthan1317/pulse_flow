import { useSocket } from "../../hooks/useSocket";

type PresenceIndicatorProps = {
  userId?: string;
  isOnline?: boolean;
  showText?: boolean;
  className?: string;
};

export const PresenceIndicator = ({
  userId,
  isOnline: isOnlineProp,
  showText = false,
  className = "",
}: PresenceIndicatorProps) => {
  const { isUserOnline } = useSocket();

  const isOnline =
    isOnlineProp !== undefined
      ? isOnlineProp
      : userId
        ? isUserOnline(userId)
        : false;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isOnline ? "bg-emerald-500" : "bg-slate-300"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      </span>
      {showText && (
        <span
          className={`text-xs font-semibold ${
            isOnline ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};
