import type { UserRole } from "./auth";
import type { Task } from "./task";

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  tasks?: Task[];
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  clientId: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;
