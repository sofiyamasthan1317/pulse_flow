import { isAxiosError } from "axios";
import type { ApiErrorResponseData } from "../types/auth";

export const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorResponseData>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
};
