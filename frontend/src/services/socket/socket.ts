import { io, type Socket } from "socket.io-client";

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

let socketInstance: Socket | null = null;

export const getSocket = (): Socket | null => socketInstance;

export const initializeSocket = (token: string, lastSeenAt?: string): Socket => {
  const socketUrl = getSocketUrl();

  if (socketInstance) {
    socketInstance.auth = { token, lastSeenAt };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(socketUrl, {
    auth: {
      token,
      lastSeenAt,
    },
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
