import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "../store/auth.store";
import {
  disconnectSocket,
  initializeSocket,
} from "../services/socket/socket";
import type {
  PresenceOnlinePayload,
  PresenceUpdatedPayload,
  RealtimeActivityEvent,
  RealtimeMissedActivityPayload,
  RealtimeNotificationEvent,
  RealtimeUnreadCountPayload,
} from "../types/socket";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Record<string, boolean>;
  isUserOnline: (userId: string) => boolean;
  missedActivities: RealtimeActivityEvent[];
  clearMissedActivities: () => void;
  joinProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
  leaveProject: (projectId: string) => void;
  latestActivity: RealtimeActivityEvent | null;
  latestNotification: RealtimeNotificationEvent | null;
  realtimeUnreadCount: number | null;
};

const LAST_SEEN_KEY = "last_seen_at";

export const SocketContext = createContext<SocketContextType | undefined>(undefined);


export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [missedActivities, setMissedActivities] = useState<RealtimeActivityEvent[]>([]);
  const [latestActivity, setLatestActivity] = useState<RealtimeActivityEvent | null>(null);
  const [latestNotification, setLatestNotification] = useState<RealtimeNotificationEvent | null>(null);
  const [realtimeUnreadCount, setRealtimeUnreadCount] = useState<number | null>(null);

  // Connection Lifecycle
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      if (socket) {
        // Save last seen time before disconnecting
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers({});
      }
      return;
    }

    const lastSeenAt = localStorage.getItem(LAST_SEEN_KEY) || undefined;
    const socketInstance = initializeSocket(accessToken, lastSeenAt);

    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      // Update last seen to current connection time
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    };

    const onDisconnect = () => {
      setIsConnected(false);
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    };

    const onConnectError = (err: Error) => {
      console.warn("[Socket] Connect error:", err.message);
      setIsConnected(false);
    };

    const onPresenceUpdated = (payload: PresenceUpdatedPayload) => {
      const userMap: Record<string, boolean> = {};
      payload.users.forEach((u) => {
        userMap[u.userId] = u.online;
      });
      setOnlineUsers(userMap);
    };

    const onPresenceOnline = (payload: PresenceOnlinePayload) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [payload.userId]: true,
      }));
    };

    const onPresenceOffline = (payload: PresenceOnlinePayload) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [payload.userId]: false,
      }));
    };

    const onActivityCreated = (activity: RealtimeActivityEvent) => {
      setLatestActivity(activity);
    };

    const onActivityMissed = (payload: RealtimeMissedActivityPayload) => {
      if (payload.events && payload.events.length > 0) {
        setMissedActivities(payload.events);
      }
    };

    const onNotificationCreated = (notif: RealtimeNotificationEvent) => {
      setLatestNotification(notif);
    };

    const onNotificationUnreadCount = (payload: RealtimeUnreadCountPayload) => {
      setRealtimeUnreadCount(payload.unreadCount);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("connect_error", onConnectError);
    socketInstance.on("presence.updated", onPresenceUpdated);
    socketInstance.on("presence.online", onPresenceOnline);
    socketInstance.on("presence.offline", onPresenceOffline);
    socketInstance.on("activity.created", onActivityCreated);
    socketInstance.on("activity.missed", onActivityMissed);
    socketInstance.on("notification.created", onNotificationCreated);
    socketInstance.on("notification.unread_count", onNotificationUnreadCount);

    if (!socketInstance.connected) {
      socketInstance.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("connect_error", onConnectError);
      socketInstance.off("presence.updated", onPresenceUpdated);
      socketInstance.off("presence.online", onPresenceOnline);
      socketInstance.off("presence.offline", onPresenceOffline);
      socketInstance.off("activity.created", onActivityCreated);
      socketInstance.off("activity.missed", onActivityMissed);
      socketInstance.off("notification.created", onNotificationCreated);
      socketInstance.off("notification.unread_count", onNotificationUnreadCount);
    };
  }, [accessToken, isAuthenticated, user]);

  const isUserOnline = useCallback(
    (userId: string): boolean => {
      if (user && user.id === userId) return true; // Current logged-in user is online
      return Boolean(onlineUsers[userId]);
    },
    [onlineUsers, user],
  );

  const clearMissedActivities = useCallback(() => {
    setMissedActivities([]);
  }, []);

  const joinProject = useCallback(
    (projectId: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket || !isConnected) {
          resolve({ success: false, error: "Socket not connected" });
          return;
        }

        socket.emit(
          "project:join",
          { projectId },
          (response: { success: boolean; error?: string; projectId?: string }) => {
            resolve({ success: response?.success ?? false, error: response?.error });
          },
        );
      });
    },
    [socket, isConnected],
  );

  const leaveProject = useCallback(
    (projectId: string): void => {
      if (socket && isConnected) {
        socket.emit("project:leave", { projectId });
      }
    },
    [socket, isConnected],
  );

  const value = useMemo<SocketContextType>(
    () => ({
      socket,
      isConnected,
      onlineUsers,
      isUserOnline,
      missedActivities,
      clearMissedActivities,
      joinProject,
      leaveProject,
      latestActivity,
      latestNotification,
      realtimeUnreadCount,
    }),
    [
      socket,
      isConnected,
      onlineUsers,
      isUserOnline,
      missedActivities,
      clearMissedActivities,
      joinProject,
      leaveProject,
      latestActivity,
      latestNotification,
      realtimeUnreadCount,
    ],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

