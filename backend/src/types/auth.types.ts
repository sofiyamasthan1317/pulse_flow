import type { Request } from "express";

import type { RoleName } from "../constants/roles.js";

export type UserRole = RoleName;

export type LoginInput = {
  email: string;
  password: string;
};

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AccessTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
  type: "access";
};

export type RefreshTokenPayload = {
  userId: string;
  tokenId: string;
  type: "refresh";
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse = {
  accessToken: string;
  user: SafeUser;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
