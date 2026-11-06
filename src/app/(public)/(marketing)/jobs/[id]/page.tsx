import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { LoadingState } from "@/components/shared/loading-state";
import JobDetailPage from "@/features/jobs/pages/job-detail-page";

type JobRouteProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: JobRouteProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResolvedPage params={params} />
    </Suspense>
  );
}

async function ResolvedPage({ params }: JobRouteProps) {
  const { id } = await params;
  return (
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <JobDetailPage jobId={id} />
    </RequireAuth>
  );
}
