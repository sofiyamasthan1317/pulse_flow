import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { AuthenticatedUser } from "../../types/auth.types.js";
import type { ProjectCreateInput, ProjectRecord, ProjectUpdateInput } from "../../types/project.types.js";

const projectInclude = {
  client: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  tasks: true,
};

const ensureProjectExists = async (projectId: string): Promise<ProjectRecord> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });

  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND");
  }

  return project;
};

const ensureActorCanAccessProject = async (projectId: string, actor: AuthenticatedUser, allowDeveloperRead = false): Promise<ProjectRecord> => {
  const project = await ensureProjectExists(projectId);

  if (actor.role === "ADMIN") {
    return project;
  }

  if (actor.role === "PROJECT_MANAGER") {
    if (project.creatorId !== actor.userId) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }
    return project;
  }

  if (allowDeveloperRead) {
    const assignedTask = await prisma.task.findFirst({
      where: {
        projectId,
        assignedDeveloperId: actor.userId,
      },
    });

    if (!assignedTask) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    return project;
  }

  throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
};

export const projectsService = {
  listProjects: async (actor: AuthenticatedUser) => {
    if (actor.role === "ADMIN") {
      return prisma.project.findMany({
        include: projectInclude,
        orderBy: { createdAt: "desc" },
      });
    }

    if (actor.role === "PROJECT_MANAGER") {
      return prisma.project.findMany({
        where: { creatorId: actor.userId },
        include: projectInclude,
        orderBy: { createdAt: "desc" },
      });
    }

    return prisma.project.findMany({
      where: {
        tasks: {
          some: {
            assignedDeveloperId: actor.userId,
          },
        },
      },
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getProjectById: async (projectId: string, actor: AuthenticatedUser) => {
    return ensureActorCanAccessProject(projectId, actor, true);
  },

  createProject: async (input: ProjectCreateInput, actor: AuthenticatedUser) => {
    if (actor.role !== "ADMIN" && actor.role !== "PROJECT_MANAGER") {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
    });

    if (!client) {
      throw new AppError("Client not found", 404, "NOT_FOUND");
    }

    return prisma.project.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        clientId: input.clientId,
        creatorId: actor.userId,
      },
      include: projectInclude,
    });
  },

  updateProject: async (projectId: string, input: ProjectUpdateInput, actor: AuthenticatedUser) => {
    const project = await ensureActorCanAccessProject(projectId, actor);

    if (actor.role === "DEVELOPER") {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    if (input.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: input.clientId },
      });

      if (!client) {
        throw new AppError("Client not found", 404, "NOT_FOUND");
      }
    }

    return prisma.project.update({
      where: { id: project.id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
        ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
      },
      include: projectInclude,
    });
  },

  deleteProject: async (projectId: string, actor: AuthenticatedUser) => {
    const project = await ensureActorCanAccessProject(projectId, actor);

    if (actor.role === "DEVELOPER") {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }

    try {
      await prisma.project.delete({
        where: { id: project.id },
      });
      return true;
    } catch {
      throw new AppError("Project cannot be deleted because it has related records", 409, "CONFLICT");
    }
  },
};
