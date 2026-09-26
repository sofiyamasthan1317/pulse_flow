import type { UserRole } from "../types/auth";

let inMemoryAccessToken: string | null = null;

export const getStoredAccessToken = (): string | null => inMemoryAccessToken;

export const setStoredAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getDefaultDashboardForRole = (role: UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "PROJECT_MANAGER":
      return "/project-manager/dashboard";
    case "DEVELOPER":
      return "/developer/dashboard";
    default:
      return "/login";
  }
};
