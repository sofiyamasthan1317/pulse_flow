import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth.types.js";

const parseDurationToMs = (value: string): number => {
  const match = value.trim().match(/^(\d+)(ms|s|m|h|d|w)$/i);

  if (!match) {
    throw new Error(`Invalid JWT duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "";

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

const signToken = <T extends Record<string, unknown>>(payload: T, secret: string, expiresInMs: number): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresInMs });
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return signToken(payload, env.JWT_ACCESS_SECRET, parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN));
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return signToken(payload, env.JWT_REFRESH_SECRET, parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid access token payload");
  }

  if (payload.type !== "access" || typeof payload.userId !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role as AccessTokenPayload["role"],
    type: "access",
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid refresh token payload");
  }

  if (payload.type !== "refresh" || typeof payload.userId !== "string" || typeof payload.tokenId !== "string") {
    throw new Error("Invalid refresh token payload");
  }

  return {
    userId: payload.userId,
    tokenId: payload.tokenId,
    type: "refresh",
  };
};
