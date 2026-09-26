export type RealtimeActivityActor = {
  id: string;
  name: string;
  role?: string;
};

export type RealtimeActivityEvent = {
  id: string;
  taskId: string;
  projectId: string;
  actor: RealtimeActivityActor;
  previousStatus?: string | null;
  oldStatus?: string | null;
  newStatus: string;
  message: string;
  createdAt: string;
};

export type RealtimeMissedActivityPayload = {
  events: RealtimeActivityEvent[];
  count: number;
};

export type RealtimeNotificationEvent = {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  taskId?: string | null;
  projectId?: string | null;
};

export type RealtimeUnreadCountPayload = {
  unreadCount: number;
};

export type PresenceOnlinePayload = {
  userId: string;
  online: boolean;
};

export type PresenceUpdatedPayload = {
  users: Array<{ userId: string; online: boolean }>;
};
