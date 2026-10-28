'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RequireAuth } from '@/components/auth/require-auth';
import { LoadingState } from '@/components/shared/loading-state';
import { useSession } from '@/lib/session/use-session';

const destination = {
  CUSTOMER: '/jobs',
  TECHNICIAN: '/technician/dashboard',
  ADMIN: '/admin',
} as const;

function Redirector() {
  const router = useRouter();
  const { data: user } = useSession();

  useEffect(() => {
    if (user) router.replace(destination[user.role as keyof typeof destination] ?? '/');
  }, [user, router]);

  return <LoadingState />;
}

export default function DashboardRedirectPage() {
  return (
    <RequireAuth roles={['CUSTOMER', 'TECHNICIAN', 'ADMIN']}>
      <Redirector />
    </RequireAuth>
  );
}
