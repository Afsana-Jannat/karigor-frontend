import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import MyJobsPage from "@/features/jobs/pages/my-jobs-page";

export default function Page() {
  return (
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN"]}>
      {/* useSearchParams needs a Suspense boundary in Next.js */}
      <Suspense fallback={<LoadingState />}>
        <MyJobsPage />
      </Suspense>
    </RequireAuth>
  );
}
