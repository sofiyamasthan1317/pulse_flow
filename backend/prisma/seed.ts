import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/utils/password.js";

const demoPassword = process.env.SEED_PASSWORD ?? "Password123!";

const addDays = (days: number): Date => {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.activityLog.deleteMany().catch(() => {});
  await prisma.task.deleteMany().catch(() => {});
  await prisma.project.deleteMany().catch(() => {});
  await prisma.client.deleteMany().catch(() => {});
  await prisma.refreshToken.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: await hashPassword(demoPassword),
      role: "ADMIN",
    },
  });

  const projectManagers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Project Manager One",
        email: "pm1@example.com",
        passwordHash: await hashPassword(demoPassword),
        role: "PROJECT_MANAGER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Project Manager Two",
        email: "pm2@example.com",
        passwordHash: await hashPassword(demoPassword),
        role: "PROJECT_MANAGER",
      },
    }),
  ]);

  const developers = await Promise.all([
    prisma.user.create({ data: { name: "Developer One", email: "dev1@example.com", passwordHash: await hashPassword(demoPassword), role: "DEVELOPER" } }),
    prisma.user.create({ data: { name: "Developer Two", email: "dev2@example.com", passwordHash: await hashPassword(demoPassword), role: "DEVELOPER" } }),
    prisma.user.create({ data: { name: "Developer Three", email: "dev3@example.com", passwordHash: await hashPassword(demoPassword), role: "DEVELOPER" } }),
    prisma.user.create({ data: { name: "Developer Four", email: "dev4@example.com", passwordHash: await hashPassword(demoPassword), role: "DEVELOPER" } }),
  ]);

  const clients = await Promise.all([
    prisma.client.create({ data: { name: "Northwind Labs", email: "contact@northwind.example.com", phone: "+1-555-0101" } }),
    prisma.client.create({ data: { name: "Harbor Works", email: "team@harbor.example.com", phone: "+1-555-0102" } }),
    prisma.client.create({ data: { name: "Beacon Group", email: "hello@beacon.example.com", phone: "+1-555-0103" } }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Operations Dashboard",
        description: "Admin-owned project for cross-team reporting and delivery planning.",
        clientId: clients[0].id,
        creatorId: admin.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Client Portal Refresh",
        description: "PM1-owned portal redesign for the client-facing experience.",
        clientId: clients[1].id,
        creatorId: projectManagers[0].id,
      },
    }),
    prisma.project.create({
      data: {
        name: "CRM Migration",
        description: "PM2-owned migration to consolidate sales operations workflows.",
        clientId: clients[2].id,
        creatorId: projectManagers[1].id,
      },
    }),
  ]);

  const taskSeedData = [
    { projectId: projects[0].id, assignedDeveloperId: developers[0].id, title: "Export weekly task summary", description: "Prepare the audit-ready status overview.", status: "TODO" as const, priority: "HIGH" as const, dueDate: addDays(-3), isOverdue: true },
    { projectId: projects[0].id, assignedDeveloperId: developers[1].id, title: "Review dependency blockers", description: "Confirm open blockers across the sprint board.", status: "IN_PROGRESS" as const, priority: "CRITICAL" as const, dueDate: addDays(-2), isOverdue: true },
    { projectId: projects[0].id, assignedDeveloperId: developers[2].id, title: "Finalize release notes", description: "Check the release checklist for launch readiness.", status: "IN_REVIEW" as const, priority: "MEDIUM" as const, dueDate: addDays(1), isOverdue: false },
    { projectId: projects[0].id, assignedDeveloperId: developers[3].id, title: "Archive completed tickets", description: "Move all resolved tickets into the archive queue.", status: "DONE" as const, priority: "LOW" as const, dueDate: addDays(-5), isOverdue: false },
    { projectId: projects[0].id, assignedDeveloperId: developers[0].id, title: "Refresh API health checklist", description: "Verify the backend status matrix before Friday review.", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: addDays(7), isOverdue: false },

    { projectId: projects[1].id, assignedDeveloperId: developers[1].id, title: "Build account settings UI", description: "Create the account management layout and state handling.", status: "IN_PROGRESS" as const, priority: "HIGH" as const, dueDate: addDays(-1), isOverdue: true },
    { projectId: projects[1].id, assignedDeveloperId: developers[2].id, title: "Review field validation", description: "Validate form error states and edge conditions.", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: addDays(2), isOverdue: false },
    { projectId: projects[1].id, assignedDeveloperId: developers[3].id, title: "QA design system tokens", description: "Confirm all tokens match approved design specs.", status: "DONE" as const, priority: "HIGH" as const, dueDate: addDays(-6), isOverdue: false },
    { projectId: projects[1].id, assignedDeveloperId: developers[0].id, title: "Prepare customer beta notes", description: "Outline beta release communication and caveats.", status: "IN_REVIEW" as const, priority: "CRITICAL" as const, dueDate: addDays(3), isOverdue: false },
    { projectId: projects[1].id, assignedDeveloperId: developers[1].id, title: "Migrate dashboard filters", description: "Refactor filtering logic on the dashboard views.", status: "TODO" as const, priority: "HIGH" as const, dueDate: addDays(5), isOverdue: false },

    { projectId: projects[2].id, assignedDeveloperId: developers[2].id, title: "Audit CRM object mappings", description: "Check the field mapping across systems before migration.", status: "IN_PROGRESS" as const, priority: "CRITICAL" as const, dueDate: addDays(-2), isOverdue: true },
    { projectId: projects[2].id, assignedDeveloperId: developers[3].id, title: "Prepare migration runbook", description: "Document the deployment and rollback sequence.", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: addDays(4), isOverdue: false },
    { projectId: projects[2].id, assignedDeveloperId: developers[0].id, title: "Clean duplicate leads", description: "Normalize duplicate contacts to prevent bad data entry.", status: "DONE" as const, priority: "LOW" as const, dueDate: addDays(-7), isOverdue: false },
    { projectId: projects[2].id, assignedDeveloperId: developers[1].id, title: "Verify pipeline automation", description: "Check automation rules for contact assignment and routing.", status: "IN_REVIEW" as const, priority: "HIGH" as const, dueDate: addDays(-1), isOverdue: true },
    { projectId: projects[2].id, assignedDeveloperId: developers[3].id, title: "Confirm stakeholder signoff", description: "Capture team signoff for the migration scope.", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: addDays(8), isOverdue: false },
  ];

  const createdTasks = await Promise.all(
    taskSeedData.map((task) => prisma.task.create({
      data: {
        projectId: task.projectId,
        assignedDeveloperId: task.assignedDeveloperId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        isOverdue: task.isOverdue,
        overdueAt: task.isOverdue ? new Date() : null,
      },
    })),
  );

  const activitySeedData = [
    { taskId: createdTasks[0]!.id, userId: developers[0].id, previousStatus: "TODO" as const, newStatus: "IN_PROGRESS" as const, message: "Task moved into active development." },
    { taskId: createdTasks[1]!.id, userId: developers[1].id, previousStatus: "TODO" as const, newStatus: "IN_PROGRESS" as const, message: "Investigated blocker and started remediation." },
    { taskId: createdTasks[2]!.id, userId: developers[2].id, previousStatus: "IN_PROGRESS" as const, newStatus: "IN_REVIEW" as const, message: "Submitted for stakeholder review." },
    { taskId: createdTasks[2]!.id, userId: developers[2].id, previousStatus: "IN_REVIEW" as const, newStatus: "DONE" as const, message: "Completed and approved for release." },
    { taskId: createdTasks[5]!.id, userId: developers[1].id, previousStatus: "TODO" as const, newStatus: "IN_PROGRESS" as const, message: "Work started on user settings page." },
    { taskId: createdTasks[8]!.id, userId: developers[0].id, previousStatus: "IN_PROGRESS" as const, newStatus: "IN_REVIEW" as const, message: "Beta notes submitted for PM feedback." },
    { taskId: createdTasks[10]!.id, userId: developers[2].id, previousStatus: "TODO" as const, newStatus: "IN_PROGRESS" as const, message: "CRM mapping review underway." },
    { taskId: createdTasks[13]!.id, userId: developers[1].id, previousStatus: "IN_PROGRESS" as const, newStatus: "IN_REVIEW" as const, message: "Pipeline automation passed validation and entered review." },
  ];

  await prisma.activityLog.createMany({
    data: activitySeedData.map((entry) => ({
      taskId: entry.taskId,
      projectId: createdTasks.find((task) => task.id === entry.taskId)?.projectId ?? projects[0].id,
      userId: entry.userId,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      message: entry.message,
      createdAt: addDays(-5),
    })),
  });

  await prisma.notification.createMany({
    data: [
      { userId: developers[0].id, message: "You were assigned \"Export weekly task summary\" in Operations Dashboard.", isRead: false, createdAt: addDays(-1) },
      { userId: developers[1].id, message: "You were assigned \"Review dependency blockers\" in Operations Dashboard.", isRead: true, readAt: addDays(-1), createdAt: addDays(-2) },
      { userId: developers[2].id, message: "Task \"Finalize release notes\" was moved to In Review.", isRead: false, createdAt: addDays(-1) },
      { userId: projectManagers[0].id, message: "Task \"Build account settings UI\" was moved to In Review.", isRead: false, createdAt: addDays(-1) },
      { userId: developers[2].id, message: "Task \"Audit CRM object mappings\" was assigned to you.", isRead: false, createdAt: addDays(-3) },
    ],
  });

  console.log(JSON.stringify({
    users: { admin: 1, projectManagers: 2, developers: 4 },
    projects: projects.length,
    tasks: createdTasks.length,
    overdueTasks: taskSeedData.filter((task) => task.isOverdue).length,
    activityLogs: activitySeedData.length,
    notifications: 5,
    demoCredentials: {
      admin: { email: "admin@example.com", password: demoPassword },
      projectManagers: [
        { email: "pm1@example.com", password: demoPassword },
        { email: "pm2@example.com", password: demoPassword },
      ],
      developers: [
        { email: "dev1@example.com", password: demoPassword },
        { email: "dev2@example.com", password: demoPassword },
        { email: "dev3@example.com", password: demoPassword },
        { email: "dev4@example.com", password: demoPassword },
      ],
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
