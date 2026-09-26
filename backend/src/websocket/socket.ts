import type { Server as HttpServer } from "node:http";

import { Server, type Socket } from "socket.io";

import { env } from "../config/env.js";
import { roles } from "../constants/roles.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AuthenticatedUser } from "../types/auth.types.js";

export type AuthenticatedSocket = Socket & {
  user?: AuthenticatedUser;
};

const userSockets = new Map<string, Set<string>>();
let io: Server | null = null;

const getUserRoom = (userId: string): string => `user:${userId}`;
const getProjectRoom = (projectId: string): string => `project:${projectId}`;

const getAuthorizedProjectIdsForUser = async (user: AuthenticatedUser): Promise<string[]> => {
  if (user.role === roles.ADMIN) {
    const projects = await prisma.project.findMany({
      select: { id: true },
    });
    return projects.map((project) => project.id);
  }

  if (user.role === roles.PROJECT_MANAGER) {
    const projects = await prisma.project.findMany({
      where: { creatorId: user.userId },
      select: { id: true },
    });
    return projects.map((project) => project.id);
  }

  return [];
};

const emitPresenceUpdate = () => {
  if (!io) {
    return;
  }

  const onlineUserIds = Array.from(userSockets.entries())
    .filter(([, socketIds]) => socketIds.size > 0)
    .map(([userId]) => ({ userId, online: true }));

  for (const socket of io.sockets.sockets.values()) {
    const user = (socket as AuthenticatedSocket).user;
    if (!user || user.role !== roles.ADMIN) {
      continue;
    }

    socket.emit("presence.updated", { users: onlineUserIds });
  }
};

export const emitUserUnreadCount = async (userId: string): Promise<void> => {
  if (!io) {
    return;
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  io.to(getUserRoom(userId)).emit("notification.unread_count", { unreadCount });
};

export const emitNotificationCreated = async (notification: { id: string; userId: string; message: string; isRead: boolean; createdAt: Date; taskId?: string | null; projectId?: string | null }): Promise<void> => {
  if (!io) {
    return;
  }

  const payload = {
    id: notification.id,
    userId: notification.userId,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    taskId: notification.taskId ?? null,
    projectId: notification.projectId ?? null,
  };

  io.to(getUserRoom(notification.userId)).emit("notification.created", payload);
  await emitUserUnreadCount(notification.userId);
};

export const emitActivityCreated = async (event: {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  userName: string;
  role: string;
  previousStatus?: string | null;
  newStatus: string;
  message: string;
  createdAt: Date;
}): Promise<void> => {
  if (!io) {
    return;
  }

  const activityPayload = {
    id: event.id,
    taskId: event.taskId,
    projectId: event.projectId,
    actor: {
      id: event.userId,
      name: event.userName,
      role: event.role,
    },
    previousStatus: event.previousStatus ?? null,
    newStatus: event.newStatus,
    message: event.message,
    createdAt: event.createdAt,
  };

  const recipients = new Set<string>();

  if (event.role === roles.ADMIN) {
    const adminUsers = await prisma.user.findMany({
      where: { role: roles.ADMIN },
      select: { id: true },
    });
    adminUsers.forEach((user) => recipients.add(user.id));
  }

  const project = await prisma.project.findUnique({
    where: { id: event.projectId },
    select: { creatorId: true },
  });

  if (project?.creatorId) {
    recipients.add(project.creatorId);
  }

  if (event.role !== roles.ADMIN) {
    const task = await prisma.task.findUnique({
      where: { id: event.taskId },
      select: { assignedDeveloperId: true },
    });

    if (task?.assignedDeveloperId) {
      recipients.add(task.assignedDeveloperId);
    }
  }

  for (const userId of recipients) {
    io.to(getUserRoom(userId)).emit("activity.created", activityPayload);
  }

  io.to(getProjectRoom(event.projectId)).emit("activity.created", activityPayload);
};

const getMissedActivityForUser = async (user: AuthenticatedUser, lastSeenAt?: string) => {
  const parsedLastSeenAt = lastSeenAt ? new Date(lastSeenAt) : undefined;

  if (lastSeenAt && parsedLastSeenAt && Number.isNaN(parsedLastSeenAt.getTime())) {
    return [];
  }

  const baseWhere = parsedLastSeenAt ? { createdAt: { gt: parsedLastSeenAt } } : {};

  let where: Record<string, unknown> = baseWhere;

  if (user.role === roles.PROJECT_MANAGER) {
    where = {
      ...baseWhere,
      project: {
        creatorId: user.userId,
      },
    };
  }

  if (user.role === roles.DEVELOPER) {
    where = {
      ...baseWhere,
      task: {
        assignedDeveloperId: user.userId,
      },
    };
  }

  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 20,
    include: {
      task: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    taskId: activity.taskId,
    projectId: activity.projectId,
    oldStatus: activity.previousStatus,
    newStatus: activity.newStatus,
    message: activity.message,
    createdAt: activity.createdAt,
    actor: {
      id: activity.user.id,
      name: activity.user.name,
    },
  }));
};

export const initializeSocket = (server: HttpServer): Server => {
  const rawOrigins = [
    ...env.SOCKET_CORS_ORIGIN.split(","),
    "https://pulse-flow-eosin.vercel.app",
  ];
  const socketOrigins = Array.from(
    new Set(rawOrigins.map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean))
  );

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.trim().replace(/\/+$/, "");
        if (socketOrigins.includes(normalizedOrigin) || (env.NODE_ENV === "development" && /^http:\/\/localhost:517\d$/.test(normalizedOrigin))) {
          return callback(null, true);
        }
        return callback(new Error("CORS policy error"), false);
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    const tokenFromAuth = socket.handshake.auth?.token;
    const tokenFromHeader = typeof socket.handshake.headers.authorization === "string"
      ? socket.handshake.headers.authorization.replace("Bearer ", "").trim()
      : undefined;

    const accessToken = typeof tokenFromAuth === "string" ? tokenFromAuth : tokenFromHeader;

    if (!accessToken) {
      next(new Error("UNAUTHORIZED"));
      return;
    }

    try {
      const payload = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error("INVALID_USER");
      }

      (socket as AuthenticatedSocket).user = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    const userRoom = getUserRoom(user.userId);
    socket.join(userRoom);

    const existingSockets = userSockets.get(user.userId) ?? new Set<string>();
    existingSockets.add(socket.id);
    userSockets.set(user.userId, existingSockets);

    socket.emit("presence.online", { userId: user.userId, online: true });
    emitPresenceUpdate();

    const lastSeenAt = typeof socket.handshake.auth?.lastSeenAt === "string" ? socket.handshake.auth.lastSeenAt : undefined;
    const missedActivity = await getMissedActivityForUser(user, lastSeenAt);
    socket.emit("activity.missed", {
      events: missedActivity,
      count: missedActivity.length,
    });

    socket.on("project:join", async ({ projectId }: { projectId?: string }, callback) => {
      if (!projectId || typeof projectId !== "string") {
        callback?.({ success: false, error: "VALIDATION_ERROR" });
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, creatorId: true },
      });

      if (!project) {
        callback?.({ success: false, error: "NOT_FOUND" });
        return;
      }

      if (user.role === roles.ADMIN) {
        socket.join(getProjectRoom(projectId));
        callback?.({ success: true, projectId });
        return;
      }

      if (user.role === roles.PROJECT_MANAGER && project.creatorId === user.userId) {
        socket.join(getProjectRoom(projectId));
        callback?.({ success: true, projectId });
        return;
      }

      callback?.({ success: false, error: "FORBIDDEN" });
    });

    socket.on("project:leave", ({ projectId }: { projectId?: string }, callback) => {
      if (!projectId || typeof projectId !== "string") {
        callback?.({ success: false, error: "VALIDATION_ERROR" });
        return;
      }

      socket.leave(getProjectRoom(projectId));
      callback?.({ success: true, projectId });
    });

    socket.on("disconnect", () => {
      const currentSockets = userSockets.get(user.userId);
      if (!currentSockets) {
        return;
      }

      currentSockets.delete(socket.id);

      if (currentSockets.size === 0) {
        userSockets.delete(user.userId);
        socket.to(getUserRoom(user.userId)).emit("presence.offline", { userId: user.userId, online: false });
      }

      emitPresenceUpdate();
    });
  });

  return io;
};

export const getSocketServer = (): Server | null => io;
