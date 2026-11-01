export const instant = false;
import AdminUserDetailPage from '@/features/admin/pages/admin-user-detail-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetailPage userId={id} />;
}