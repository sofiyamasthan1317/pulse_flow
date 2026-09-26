import type { ErrorRequestHandler } from "express";

import { sendError } from "../utils/response.js";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return _next(error);
  }

  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const errorCode = isAppError ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isAppError ? error.message : "Something went wrong";

  res.status(statusCode).json(
    sendError(message, errorCode),
  );
};
