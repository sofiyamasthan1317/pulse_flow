import axios, { type InternalAxiosRequestConfig } from "axios";
import { getStoredAccessToken, setStoredAccessToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

let onAuthFailureCallback: (() => void) | null = null;
let onTokenRefreshedCallback: ((token: string, user?: unknown) => void) | null = null;

export const registerAuthCallbacks = (
  onRefreshed: (token: string, user?: unknown) => void,
  onFailed: () => void,
) => {
  onTokenRefreshedCallback = onRefreshed;
  onAuthFailureCallback = onFailed;
};

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: attach bearer token from memory
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 & auto refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh token request (HttpOnly cookie will be attached automatically via withCredentials: true)
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const data = refreshResponse.data?.data;
        const newToken = data?.accessToken;
        const user = data?.user;

        if (!newToken) {
          throw new Error("No access token returned from refresh");
        }

        setStoredAccessToken(newToken);
        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback(newToken, user);
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setStoredAccessToken(null);

        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
