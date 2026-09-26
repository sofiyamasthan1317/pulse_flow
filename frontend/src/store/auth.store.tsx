import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import { registerAuthCallbacks } from "../api/client";
import type { AuthUser, LoginCredentials } from "../types/auth";
import { setStoredAccessToken } from "../utils/auth";

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthContextType = AuthState & {
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  loadCurrentUser: () => Promise<AuthUser | null>;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setStoredAccessToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, [setAccessToken]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const data = await authApi.refresh();
      setAccessToken(data.accessToken);
      setUser(data.user);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [setAccessToken, clearAuth]);

  const loadCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const fetchedUser = await authApi.getCurrentUser();
      setUser(fetchedUser);
      return fetchedUser;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const data = await authApi.login(credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [setAccessToken],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // Register Axios auto-refresh callbacks
  useEffect(() => {
    registerAuthCallbacks(
      (newToken: string, refreshedUser?: unknown) => {
        setAccessToken(newToken);
        if (refreshedUser) {
          setUser(refreshedUser as AuthUser);
        }
      },
      () => {
        clearAuth();
      },
    );
  }, [setAccessToken, clearAuth]);

  // Initial startup session check
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const refreshed = await refreshSession();
        if (!refreshed && isMounted) {
          clearAuth();
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshSession, clearAuth]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      logout,
      refreshSession,
      loadCurrentUser,
      setAccessToken,
      clearAuth,
    }),
    [
      user,
      accessToken,
      isLoading,
      login,
      logout,
      refreshSession,
      loadCurrentUser,
      setAccessToken,
      clearAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
