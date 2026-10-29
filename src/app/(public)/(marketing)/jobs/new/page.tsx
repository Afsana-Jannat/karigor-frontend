import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import NewJobPage from "@/features/jobs/pages/new-job-page";

export default function Page() {
  return (
    // TECHNICIAN is allowed through so the page can explain that only
    // customers post jobs, instead of showing a generic "not found".
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN"]}>
      {/* useSearchParams needs a Suspense boundary in Next.js */}
      <Suspense fallback={<LoadingState />}>
        <NewJobPage />
      </Suspense>
    </RequireAuth>
  );
}
