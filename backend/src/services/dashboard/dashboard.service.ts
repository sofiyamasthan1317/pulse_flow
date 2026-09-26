import { prisma } from "../../lib/prisma.js";

const taskStatusValues = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const taskPriorityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const priorityOrder: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const buildEmptyStatusMap = () => Object.fromEntries(taskStatusValues.map((status) => [status, 0]));
const buildEmptyPriorityMap = () => Object.fromEntries(taskPriorityValues.map((priority) => [priority, 0]));

const getCurrentWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const dashboardService = {
  getAdminDashboard: async () => {
    const [totalProjects, taskCounts, overdueTasks] = await Promise.all([
      prisma.project.count(),
      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.task.count({
        where: {
          isOverdue: true,
        },
      }),
    ]);

    const tasksByStatus = buildEmptyStatusMap();
    for (const entry of taskCounts) {
      tasksByStatus[entry.status] = entry._count.status;
    }

    return {
      totalProjects,
      tasksByStatus,
      overdueTasks,
    };
  },

  getProjectManagerDashboard: async (userId: string) => {
    const projects = await prisma.project.findMany({
      where: { creatorId: userId },
      select: { id: true },
    });

    const projectIds = projects.map((project) => project.id);

    const [totalTasks, priorityCounts, upcomingDueTasks] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { projectId: { in: projectIds } },
        _count: { priority: true },
      }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          dueDate: {
            gte: getCurrentWeekRange().start,
            lte: getCurrentWeekRange().end,
          },
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const tasksByPriority = buildEmptyPriorityMap();
    for (const entry of priorityCounts) {
      tasksByPriority[entry.priority] = entry._count.priority;
    }

    return {
      totalProjects: projectIds.length,
      totalTasks,
      tasksByPriority,
      upcomingDueTasks: upcomingDueTasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        project: task.project,
      })),
    };
  },

  getDeveloperDashboard: async (userId: string) => {
    const tasks = await prisma.task.findMany({
      where: {
        assignedDeveloperId: userId,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const sortedTasks = [...tasks].sort((left, right) => {
      const priorityDiff = (priorityOrder[right.priority] ?? 0) - (priorityOrder[left.priority] ?? 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return leftDue - rightDue;
    });

    return {
      totalAssignedTasks: sortedTasks.length,
      tasks: sortedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        project: task.project,
        assignedDeveloper: {
          id: task.assignedDeveloperId,
        },
      })),
    };
  },
};
