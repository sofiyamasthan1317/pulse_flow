import type { Request, Response, NextFunction } from "express";

import { AppError } from "./error.middleware.js";

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
};
