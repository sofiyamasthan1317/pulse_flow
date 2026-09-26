# Project Management Dashboard

This project is a full-stack client project dashboard for planning, task execution, role-based access control, and live collaboration. It supports project creation and ownership boundaries, task assignment, activity tracking, real-time notifications, and overdue automation for project work.

## Tech Stack

- React
- TypeScript
- Node.js
- Express
- PostgreSQL
- Prisma
- Socket.io
- JWT

## Setup

1. Clone the repository.
2. Install dependencies in both apps:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure environment variables in backend/.env based on backend/.env.example.
4. Run Prisma migrations and generate the client:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```
5. Seed development data:
   ```bash
   npx prisma db seed
   ```
6. Start the backend:
   ```bash
   npm run dev
   ```
7. Start the frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Architecture

Frontend
    ↓
REST API + Socket.io
    ↓
Controllers
    ↓
Services
    ↓
Prisma
    ↓
PostgreSQL

The backend exposes authenticated API routes for auth, projects, tasks, notifications, and dashboards. UI actions are validated by the backend and authorization checks are enforced in service-layer ownership logic instead of trusting client-side state. Activity, notifications, and presence are emitted through Socket.io channels keyed by user and project scope.

## Authentication

Authentication uses short-lived access tokens for API authorization plus an HttpOnly refresh token cookie. Refresh tokens are rotated and stored in the database as hashes, then revoked when logout or reuse is detected. This keeps tokens out of browser storage while preserving secure server-side revocation.

## RBAC

Three roles are supported:

- ADMIN: global access and admin dashboard visibility
- PROJECT_MANAGER: manages projects they own and tasks within those projects
- DEVELOPER: can view assigned tasks and update permitted status fields only

Resource ownership is checked in service logic so a user cannot use the frontend to alter another team’s project or task.

## Real-time Architecture

Socket.io is used for live activity and notifications. User rooms isolate per-user delivery, project rooms provide project-scoped broadcasts, and presence tracking keeps a logical online/offline state for each user. Missed activity recovery is served from PostgreSQL rather than an in-memory queue, so reconnecting clients can fetch recent events from the database.

## Background Job

The scheduler audits all tasks each hour and marks any task as overdue when:

- dueDate is in the past
- status is not DONE
- the task is not already resolved as overdue

Tasks that have a future due date, no due date, or are already DONE remain valid and are cleared from the overdue state if needed.

## Why These Design Choices Matter

Socket.io was selected instead of raw WebSocket because it gives managed room support, transport fallback, and easier multi-client event delivery. PostgreSQL is used as the source of truth for persistent activity and notifications because these records must survive reconnects and support permissioned retrieval. Prisma transactions are used around task updates, activity log creation, and notification creation so the database remains consistent if a dependent write fails. JWT plus HttpOnly refresh cookies protect authenticated sessions while preventing browser-side token theft from localStorage. Ownership checks live in services instead of the UI so authorization remains enforced by the backend.

## Indexing

Important indexes are used to support common query paths.

- Task.projectId: project-scoped task queries
- Task.assignedDeveloperId: developer task queries
- Task.status / priority / dueDate: filtering and dashboard data
- ActivityLog.createdAt: chronological activity feeds
- Notification.userId: user notification lookups

## Limitations

This project is designed for a single backend instance. Presence tracking and the background scheduler run in-process, so there is no distributed queue or Redis-backed socket adapter. The overdue scheduler is intentionally kept inside the app process and is not meant to replace a production job system with multiple worker instances.

## Architecture Summary (150–250 words)

The application follows a layered backend architecture: the Express API receives UI requests, controllers forward validated input to service logic, and services enforce authorization, ownership, business rules, and transactional database updates. Role checks are defined by ADMIN, PROJECT_MANAGER, and DEVELOPER, and ownership rules are enforced server-side so the frontend cannot be trusted to decide access. Task updates and related activity/notification writes are performed in Prisma transactions to prevent split-brain states where a status changes without a matching audit log or notification. The PostgreSQL database stores projects, tasks, activity tables, notifications, users, and refresh-token records, giving the system persistent state for audits, missed event recovery, and dashboard aggregations.

Real-time behavior is implemented with Socket.io, where user rooms carry personal updates, project rooms carry project-level activity, and presence tracking reflects connected logical users. Activity events are restricted to the relevant project manager and assigned developer audience, while notifications are delivered only to the target user. The background job runs independently from page loads and scans for expired task deadlines each hour, updating the overdue flag without depending on any user-triggered request path. This keeps the dashboard dependable even when no client is actively connected.
