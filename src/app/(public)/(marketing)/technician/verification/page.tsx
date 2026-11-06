import { RequireAuth } from "@/components/auth/require-auth";
import TechnicianVerificationPage from "@/features/technician/pages/technician-verification-page";

export default function TechnicianVerificationRoute() {
  return (
    <RequireAuth roles={["TECHNICIAN"]}>
      <TechnicianVerificationPage />
    </RequireAuth>
  );
}
