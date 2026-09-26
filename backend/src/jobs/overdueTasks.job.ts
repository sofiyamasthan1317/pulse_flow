import { prisma } from "../lib/prisma.js";

const OVERDUE_JOB_INTERVAL_MS = 60 * 60 * 1000;
const OVERDUE_JOB_SCHEDULE = "every hour";

export const runOverdueTasksJob = async (): Promise<{ updatedCount: number; clearedCount: number; examinedCount: number }> => {
  const now = new Date();

  const tasksToMarkOverdue = await prisma.task.findMany({
    where: {
      dueDate: {
        lt: now,
      },
      status: {
        not: "DONE",
      },
      OR: [
        { isOverdue: false },
        { overdueAt: null },
      ],
    },
    select: { id: true },
  });

  const tasksToClearOverdue = await prisma.task.findMany({
    where: {
      OR: [
        { dueDate: null },
        { dueDate: { gte: now } },
        { status: "DONE" },
      ],
      isOverdue: true,
    },
    select: { id: true },
  });

  const overdueTaskIds = tasksToMarkOverdue.map((task) => task.id);
  const clearTaskIds = tasksToClearOverdue.map((task) => task.id);

  const markResult = overdueTaskIds.length > 0
    ? await prisma.task.updateMany({
        where: { id: { in: overdueTaskIds } },
        data: { isOverdue: true, overdueAt: now },
      })
    : { count: 0 };

  const clearResult = clearTaskIds.length > 0
    ? await prisma.task.updateMany({
        where: { id: { in: clearTaskIds } },
        data: { isOverdue: false, overdueAt: null },
      })
    : { count: 0 };

  return {
    updatedCount: markResult.count,
    clearedCount: clearResult.count,
    examinedCount: tasksToMarkOverdue.length + tasksToClearOverdue.length,
  };
};

export const startOverdueTasksScheduler = (): void => {
  void (async () => {
    try {
      const result = await runOverdueTasksJob();
      console.info("Overdue task job completed on startup", {
        updatedCount: result.updatedCount,
        clearedCount: result.clearedCount,
        examinedCount: result.examinedCount,
        schedule: OVERDUE_JOB_SCHEDULE,
      });
    } catch (error) {
      console.error("Overdue task job failed on startup", {
        message: error instanceof Error ? error.message : "Unknown error",
        schedule: OVERDUE_JOB_SCHEDULE,
      });
    }
  })();

  const scheduleId = setInterval(async () => {
    try {
      const result = await runOverdueTasksJob();
      console.info("Overdue task job completed", {
        updatedCount: result.updatedCount,
        clearedCount: result.clearedCount,
        examinedCount: result.examinedCount,
        schedule: OVERDUE_JOB_SCHEDULE,
      });
    } catch (error) {
      console.error("Overdue task job failed", {
        message: error instanceof Error ? error.message : "Unknown error",
        schedule: OVERDUE_JOB_SCHEDULE,
      });
    }
  }, OVERDUE_JOB_INTERVAL_MS);

  if (typeof scheduleId === "object" && "unref" in scheduleId && typeof scheduleId.unref === "function") {
    scheduleId.unref();
  }

  console.info("Overdue task scheduler started", { schedule: OVERDUE_JOB_SCHEDULE });
};

export const overdueTasksJob = { start: startOverdueTasksScheduler, run: runOverdueTasksJob };
