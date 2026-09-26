import type { RoleName } from "../constants/roles.js";

export type ProjectCreateInput = {
  name: string;
  description?: string;
  clientId: string;
};

export type ProjectUpdateInput = {
  name?: string;
  description?: string;
  clientId?: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
    role: RoleName;
  };
};
