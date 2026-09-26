# Frontend — Real-Time Client Project Dashboard

Frontend application for the Real-Time Client Project Dashboard built with React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Axios, and Socket.io Client.

## Features

- **Authentication & Security**: In-memory Access Token state with HttpOnly Cookie-based Refresh Tokens.
- **Role-Based Access Control (RBAC)**: Role-tailored dashboards and layouts for `ADMIN`, `PROJECT_MANAGER`, and `DEVELOPER`.
- **Projects & Tasks Management**: Project list, creation, details, task creation, assignment, status tracking, priority tagging, and due date management with confirmation dialogs for destructive actions.
- **URL Filter Synchronization**: Database-side filtering for task `status`, `priority`, `dueFrom`, and `dueTo` parameters fully synced with URL search params.
- **Real-Time Integration (Socket.io)**: Live notification updates, activity prepending, project room scoping (`project:join`), online user presence tracking, and missed activity recovery.
- **Responsive Layout**: Mobile sidebar drawer, responsive stat grids, overflow-managed data tables, dropdown menus, and accessibility (ARIA) attributes.

## Setup & Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure environment variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   ```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# TypeScript type check
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

## Security Design Choices

- **Tokens**: Access tokens are kept strictly in-memory inside React state (`auth.store.tsx`) and memory variables. Refresh tokens are set by the server as `HttpOnly` cookies (`withCredentials: true`) and never stored in `localStorage` or `sessionStorage`.
- **401 Refresh Handling**: Axios interceptors automatically retry requests after session refresh and queue simultaneous failed requests without triggering redundant refresh calls.
- **Authorization Boundary**: Client-side role checks serve UX convenience (hiding/disabling unauthorized controls); backend authorization remains authoritative.
