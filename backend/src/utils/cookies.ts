import type { Response } from "express";

import { env } from "../config/env.js";

const parseDurationToMs = (value: string): number => {
  const match = value.trim().match(/^(\d+)(ms|s|m|h|d|w)$/i);

  if (!match) {
    throw new Error(`Invalid JWT duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "";

  if (!unit) {
    throw new Error(`Invalid JWT duration format: ${value}`);
  }

  const unitMap: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * (unitMap[unit] ?? 0);
};

export const getRefreshTokenMaxAgeMs = (): number => parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN ?? "7d");

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: getRefreshTokenMaxAgeMs(),
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    path: refreshCookieOptions.path,
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  });
};
