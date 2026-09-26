import { AppError } from "../../middleware/error.middleware.js";
import type { LoginInput, RegistrationInput } from "../../types/auth.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const validateRegistrationInput = ({ name, email, password }: RegistrationInput): RegistrationInput => {
  const trimmedName = name?.trim();

  if (!trimmedName || trimmedName.length < 2) {
    throw new AppError("Name must be at least 2 characters long", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = normalizeEmail(email ?? "");

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AppError("A valid email address is required", 400, "VALIDATION_ERROR");
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400, "VALIDATION_ERROR");
  }

  return {
    name: trimmedName,
    email: normalizedEmail,
    password,
  };
};

export const validateLoginInput = ({ email, password }: LoginInput): LoginInput => {
  const normalizedEmail = normalizeEmail(email ?? "");

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AppError("A valid email address is required", 400, "VALIDATION_ERROR");
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400, "VALIDATION_ERROR");
  }

  return {
    email: normalizedEmail,
    password,
  };
};
