import { AppError } from "../../middleware/error.middleware.js";
import type { ProjectCreateInput, ProjectUpdateInput } from "../../types/project.types.js";

export const validateProjectInput = (input: ProjectCreateInput | ProjectUpdateInput, isUpdate = false): ProjectCreateInput | ProjectUpdateInput => {
  if (!isUpdate) {
    if (!input.name || !input.name.trim()) {
      throw new AppError("Project name is required", 400, "VALIDATION_ERROR");
    }

    if (!input.clientId || !input.clientId.trim()) {
      throw new AppError("Client is required", 400, "VALIDATION_ERROR");
    }
  }

  const sanitizedName = input.name?.trim();
  if (sanitizedName !== undefined && sanitizedName.length < 2) {
    throw new AppError("Project name must be at least 2 characters long", 400, "VALIDATION_ERROR");
  }

  const sanitizedDescription = input.description?.trim();
  const clientId = input.clientId?.trim();

  if (clientId !== undefined && !clientId) {
    throw new AppError("Client is required", 400, "VALIDATION_ERROR");
  }

  if (isUpdate) {
    return {
      ...(input as ProjectUpdateInput),
      ...(sanitizedName !== undefined ? { name: sanitizedName } : {}),
      ...(sanitizedDescription !== undefined ? { description: sanitizedDescription } : {}),
      ...(clientId !== undefined ? { clientId } : {}),
    };
  }

  return {
    name: sanitizedName ?? "",
    ...(sanitizedDescription !== undefined ? { description: sanitizedDescription } : {}),
    clientId: clientId ?? "",
  };
};
