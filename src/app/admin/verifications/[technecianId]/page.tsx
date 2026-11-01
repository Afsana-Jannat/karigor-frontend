export const instant = false;
import AdminVerificationDetailPage from '@/features/admin/pages/admin-verification-detail-page';

export default async function Page({ params }: { params: Promise<{ technecianId: string }> }) {
  const { technecianId } = await params;
  console.log(technecianId, "tec id from route");

  return <AdminVerificationDetailPage technicianId={technecianId} />;
}