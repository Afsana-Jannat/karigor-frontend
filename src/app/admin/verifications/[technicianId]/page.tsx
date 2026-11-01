import AdminVerificationDetailPage from '@/features/admin/pages/admin-verification-detail-page';

export default async function Page({ params }: { params: Promise<{ technicianId: string }> }) {
  const { technicianId } = await params;
  return <AdminVerificationDetailPage technicianId={technicianId} />;
}