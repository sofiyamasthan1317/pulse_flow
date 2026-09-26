import { randomUUID } from "node:crypto";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { LoginInput, RegistrationInput, SafeUser } from "../../types/auth.types.js";
import { getRefreshTokenMaxAgeMs } from "../../utils/cookies.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { compareHash, comparePassword, hashPassword, hashTokenValue } from "../../utils/password.js";

const mapUserToSafeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildTokenPair = (user: { id: string; email: string; role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" }) => {
  const tokenId = randomUUID();
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    type: "access",
  });
  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenId,
    type: "refresh",
  });

  return { accessToken, refreshToken };
};

const createRefreshTokenRecord = async (userId: string, refreshToken: string) => {
  const tokenHash = await hashTokenValue(refreshToken);
  const expiresAt = new Date(Date.now() + getRefreshTokenMaxAgeMs());

  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
};

export const authService = {
  registerUser: async ({ name, email, password }: RegistrationInput) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError("An account with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role: "DEVELOPER",
      },
    });

    return {
      user: mapUserToSafeUser(user),
    };
  },

  loginUser: async ({ email, password }: LoginInput) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const { accessToken, refreshToken } = buildTokenPair(user);
    await createRefreshTokenRecord(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: mapUserToSafeUser(user),
    };
  },

  refreshAccessToken: async (refreshTokenValue: string) => {
    if (!refreshTokenValue) {
      throw new AppError("Refresh token is required", 401, "INVALID_REFRESH_TOKEN");
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshTokenValue);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const activeRefreshTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const matchingToken = await Promise.all(
      activeRefreshTokens.map(async (tokenRecord) => {
        const isMatch = await compareHash(refreshTokenValue, tokenRecord.tokenHash);
        return isMatch ? tokenRecord : null;
      }),
    ).then((matches) => matches.find(Boolean) ?? null);

    if (!matchingToken) {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentRecord = await tx.refreshToken.findUnique({
        where: { id: matchingToken.id },
      });

      if (!currentRecord || currentRecord.revokedAt) {
        throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
      }

      const nextRefreshToken = signRefreshToken({
        userId: user.id,
        tokenId: randomUUID(),
        type: "refresh",
      });

      const newRefreshRecord = await createRefreshTokenRecord(user.id, nextRefreshToken);

      await tx.refreshToken.update({
        where: { id: currentRecord.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: newRefreshRecord.id,
        },
      });

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      });

      return {
        accessToken,
        refreshToken: nextRefreshToken,
        user: mapUserToSafeUser(user),
      };
    });

    return result;
  },

  logoutUser: async (refreshTokenValue?: string): Promise<void> => {
    if (!refreshTokenValue) {
      return;
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshTokenValue);
    } catch {
      return;
    }

    const tokenRecords = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        revokedAt: null,
      },
    });

    const matchingToken = await Promise.all(
      tokenRecords.map(async (tokenRecord) => {
        const isMatch = await compareHash(refreshTokenValue, tokenRecord.tokenHash);
        return isMatch ? tokenRecord : null;
      }),
    ).then((matches) => matches.find(Boolean) ?? null);

    if (!matchingToken) {
      return;
    }

    await prisma.refreshToken.update({
      where: { id: matchingToken.id },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  getCurrentUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      user: mapUserToSafeUser(user),
    };
  },
};
