import * as dotenv from "dotenv";

dotenv.config();

const requiredEnvKeys = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "FRONTEND_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "SOCKET_CORS_ORIGIN",
] as const;

for (const key of requiredEnvKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/project_management",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "https://pulse-flow-eosin.vercel.app",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "development_access_secret_change_me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "development_refresh_secret_change_me",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN ?? "https://pulse-flow-eosin.vercel.app",
} as const;
