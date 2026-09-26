import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "./error.middleware.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new AppError("Access token is required", 401, "MISSING_ACCESS_TOKEN");
    }

    const accessToken = authorizationHeader.replace("Bearer ", "").trim();

    if (!accessToken) {
      throw new AppError("Access token is required", 401, "MISSING_ACCESS_TOKEN");
    }

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
      throw new AppError("User is not active or not found", 401, "INVALID_ACCESS_TOKEN");
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof Error && error.name === "TokenExpiredError") {
      next(new AppError("Access token expired", 401, "ACCESS_TOKEN_EXPIRED"));
      return;
    }

    next(new AppError("Invalid access token", 401, "INVALID_ACCESS_TOKEN"));
  }
};
