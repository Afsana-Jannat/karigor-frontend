import { RequireAuth } from "@/components/auth/require-auth";
import TechnicianDashboardPage from "@/features/technician/pages/technician-dashboard-page";

export default function TechnicianDashboardRoute() {
  return (
    <RequireAuth roles={['TECHNICIAN']}>
      <TechnicianDashboardPage />
    </RequireAuth>
  );
}