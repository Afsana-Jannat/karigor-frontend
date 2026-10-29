import { RequireAuth } from "@/components/auth/require-auth";
import ContractPage from "@/features/contracts/pages/contract-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth roles={["CUSTOMER", "TECHNICIAN", "ADMIN"]}>
      <ContractPage jobId={id} />
    </RequireAuth>
  );
}
