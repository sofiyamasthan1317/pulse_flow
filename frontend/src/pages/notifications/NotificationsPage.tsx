import { NotificationList } from "../../components/notifications/NotificationList";

export const NotificationsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
      <p className="text-sm text-slate-500 mt-1">Stay up to date with your project and task updates</p>
    </div>
    <NotificationList />
  </div>
);
