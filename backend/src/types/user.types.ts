import type { RoleName } from "../constants/roles.js";

export type User = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
};
