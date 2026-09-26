import { Router } from "express";

import { authController } from "../controllers/auth/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authMiddleware, authController.getCurrentUser);

export default authRoutes;
