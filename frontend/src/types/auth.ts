export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthSuccessData = {
  accessToken: string;
  user: AuthUser;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type ApiErrorResponseData = {
  success: false;
  message: string;
  error?: {
    code?: string;
  };
};
