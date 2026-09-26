export type Project = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
};
