import { AdminDashboardPage } from "../admin/AdminDashboardPage";
import { PMDashboardPage } from "../project-manager/PMDashboardPage";
import { DeveloperDashboardPage } from "../developer/DeveloperDashboardPage";
import { useAuth } from "../../store/auth.store";

export const DashboardPage = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <AdminDashboardPage />;
    case "PROJECT_MANAGER":
      return <PMDashboardPage />;
    case "DEVELOPER":
      return <DeveloperDashboardPage />;
    default:
      return null;
  }
};
