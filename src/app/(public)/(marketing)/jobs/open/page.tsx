import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import OpenJobsPage from "@/features/jobs/pages/open-jobs-page";

export default function Page() {
  return (
    <RequireAuth roles={["TECHNICIAN"]}>
      {/* useSearchParams needs a Suspense boundary in Next.js */}
      <Suspense fallback={<LoadingState />}>
        <OpenJobsPage />
      </Suspense>
    </RequireAuth>
  );
}
