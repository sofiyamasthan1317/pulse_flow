import type { NextFunction, Request, Response } from "express";

import { AppError } from "./error.middleware.js";
import type { RoleName } from "../constants/roles.js";

export const requireRoles = (...allowedRoles: RoleName[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};

export const hasRequiredRole = (userRole: RoleName | undefined, allowedRoles: RoleName[]): boolean => {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
};
