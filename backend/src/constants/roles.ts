export const roles = {
  ADMIN: "ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  DEVELOPER: "DEVELOPER",
} as const;

export type RoleName = (typeof roles)[keyof typeof roles];

export const roleValues = Object.values(roles) as RoleName[];
