
import { RequireAuth } from '@/components/auth/require-auth';
import TechnicianOnboardingPage from '@/features/technician/pages/technician-onboarding-page';

export default function Page() {
  return (
    <RequireAuth roles={['TECHNICIAN']}>
      <TechnicianOnboardingPage />
    </RequireAuth>
  );
}
