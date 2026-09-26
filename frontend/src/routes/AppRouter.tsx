import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminProjectDetailsPage } from "../pages/admin/AdminProjectDetailsPage";
import { AdminProjectsPage } from "../pages/admin/AdminProjectsPage";
import { AdminTasksPage } from "../pages/admin/AdminTasksPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { ActivityPage } from "../pages/activity/ActivityPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { UnauthorizedPage } from "../pages/common/UnauthorizedPage";
import { DeveloperDashboardPage } from "../pages/developer/DeveloperDashboardPage";
import { DeveloperTaskDetailsPage } from "../pages/developer/DeveloperTaskDetailsPage";
import { DeveloperTasksPage } from "../pages/developer/DeveloperTasksPage";
import { NotificationsPage } from "../pages/notifications/NotificationsPage";
import { PMDashboardPage } from "../pages/project-manager/PMDashboardPage";
import { ProjectDetailsPage } from "../pages/project-manager/ProjectDetailsPage";
import { ProjectsPage } from "../pages/project-manager/ProjectsPage";
import { TasksPage } from "../pages/project-manager/TasksPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { TaskDetailsPage } from "../pages/tasks/TaskDetailsPage";
import { useAuth } from "../store/auth.store";
import { getDefaultDashboardForRole } from "../utils/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultDashboardForRole(user.role)} replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Profile (all roles) */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* ADMIN routes */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <Navigate to="/admin/dashboard" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminProjectsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projects/:projectId"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminProjectDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminTasksPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/tasks/:taskId"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <TaskDetailsPage basePath="/admin" />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <ActivityPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <NotificationsPage />
            </RoleRoute>
          }
        />

        {/* PROJECT_MANAGER routes */}
        <Route
          path="/project-manager"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <Navigate to="/project-manager/dashboard" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/dashboard"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <PMDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/projects"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <ProjectsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/projects/:projectId"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <ProjectDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/tasks"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <TasksPage />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/tasks/:taskId"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <TaskDetailsPage basePath="/project-manager" />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/activity"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <ActivityPage />
            </RoleRoute>
          }
        />
        <Route
          path="/project-manager/notifications"
          element={
            <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
              <NotificationsPage />
            </RoleRoute>
          }
        />

        {/* DEVELOPER routes */}
        <Route
          path="/developer"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <Navigate to="/developer/dashboard" replace />
            </RoleRoute>
          }
        />
        <Route
          path="/developer/dashboard"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <DeveloperDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/developer/tasks"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <DeveloperTasksPage />
            </RoleRoute>
          }
        />
        <Route
          path="/developer/tasks/:taskId"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <DeveloperTaskDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/developer/activity"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <ActivityPage />
            </RoleRoute>
          }
        />
        <Route
          path="/developer/notifications"
          element={
            <RoleRoute allowedRoles={["DEVELOPER"]}>
              <NotificationsPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
