import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../middleware/error.middleware.js";
import { authService } from "../../services/auth/auth.service.js";
import type { AuthenticatedRequest } from "../../types/auth.types.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../../utils/cookies.js";
import { sendSuccess } from "../../utils/response.js";
import { validateLoginInput, validateRegistrationInput } from "../../validators/auth/auth.validator.js";

const handleError = (error: unknown, next: NextFunction): void => {
  if (error instanceof AppError) {
    next(error);
    return;
  }

  if (typeof error === "object" && error !== null && "statusCode" in error && "message" in error) {
    const errObj = error as { message: string; statusCode: number; code?: string };
    next(new AppError(errObj.message, errObj.statusCode || 500, errObj.code || "AUTHENTICATION_ERROR"));
    return;
  }

  const message = error instanceof Error ? error.message : "Authentication request failed";
  next(new AppError(message, 500, "AUTHENTICATION_ERROR"));
};

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = validateRegistrationInput(req.body);
      const result = await authService.registerUser(input);
      res.status(201).json(sendSuccess(result, "User registered successfully"));
    } catch (error) {
      handleError(error, next);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = validateLoginInput(req.body);
      const result = await authService.loginUser(input);

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        sendSuccess(
          {
            accessToken: result.accessToken,
            user: result.user,
          },
          "Login successful",
        ),
      );
    } catch (error) {
      handleError(error, next);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 401, "INVALID_REFRESH_TOKEN");
      }

      const result = await authService.refreshAccessToken(refreshToken);
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        sendSuccess(
          {
            accessToken: result.accessToken,
            user: result.user,
          },
          "Token refreshed successfully",
        ),
      );
    } catch (error) {
      handleError(error, next);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      await authService.logoutUser(refreshToken);
      clearRefreshTokenCookie(res);

      res.status(200).json(sendSuccess({ ok: true }, "Logged out successfully"));
    } catch (error) {
      clearRefreshTokenCookie(res);
      handleError(error, next);
    }
  },

  getCurrentUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("Authentication required", 401, "MISSING_ACCESS_TOKEN");
      }

      const result = await authService.getCurrentUser(userId);
      res.status(200).json(sendSuccess(result, "Current user fetched successfully"));
    } catch (error) {
      handleError(error, next);
    }
  },
};
