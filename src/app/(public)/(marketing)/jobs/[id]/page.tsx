import { RequireAuth } from "@/components/auth/require-auth";
import JobDetailPage from "@/features/jobs/pages/job-detail-page";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <Suspense>
        <JobDetailPage jobId={id} />
      </Suspense>
      
    </RequireAuth>
  );
}
