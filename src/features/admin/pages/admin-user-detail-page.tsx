'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ban, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useAdminUserDetail, useToggleBlockUser } from '../queries';
import { BlockUserDialog } from '../components/block-user-dialog';
import { useSession } from '@/lib/session/use-session';
import { formatMoney } from '@/lib/format';
import { roleLabels } from '@/lib/labels';
import { log } from 'console';


const jobStatusLabels: Record<string, string> = {
  PENDING: 'অপেক্ষমাণ',
  ONGOING: 'চলমান',
  COMPLETED: 'সম্পন্ন',
  CANCELLED: 'বাতিল',
  ACCEPTED: 'গৃহীত',
  IN_PROGRESS: 'চলমান',
};

export default function AdminUserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [blockModalOpen, setBlockModalOpen] = React.useState(false);

  const { data: user, isLoading } = useAdminUserDetail(userId);
  const toggleBlockMutation = useToggleBlockUser(userId);
  console.log("Entire User Object from API:", user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-500 font-medium">ব্যবহারকারী পাওয়া যায়নি</p>
      </div>
    );
  }

  const isSelf = session?.id === user.id;
  const isAdmin = user.role === 'ADMIN';
  const isBlocked = user.status === 'BLOCKED';

  // সেফ নাম্বার কনভার্শন ও ফলব্যাক (NaN এড়ানোর জন্য)
  const reportsFiledCount = Number(user?.reportsFiledCount ?? 0);
  const reportsReceivedCount = Number(user?.reportsReceivedCount ?? 0);
  const totalPayment = Number(user?.totalPaymentAmount ?? 0);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand transition"
      >
        <ArrowLeft size={16} /> পেছনে ফিরে যান
      </button>

      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-brand">{user.name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand">
              {roleLabels[user.role as keyof typeof roleLabels] || user.role}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
            >
              {user.status}
            </span>
          </div>
          <p className="text-sm font-mono text-slate-500">{user.phone}</p>
        </div>

        {/* Hide block button for self and admins */}
        {!isSelf && !isAdmin && (
          <button
            onClick={() => setBlockModalOpen(true)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${isBlocked
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
          >
            {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
            {isBlocked ? 'ব্লক তুলে নিন' : 'ব্যবহারকারীকে ব্লক করুন'}
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">অভিযোগ (দাখিলকৃত)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{reportsFiledCount} টি</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">অভিযোগ (প্রাপ্ত)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{reportsReceivedCount} টি</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট পেমেন্ট পরিমাণ</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatMoney(totalPayment)}</h3>
        </div>
      </div>

      {/* Job counts breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">কাজের পরিসংখ্যান (Job Counts)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {user.jobCounts && Object.keys(user.jobCounts).length > 0 ? (
            Object.entries(user.jobCounts).map(([statusKey, count]) => (
              <div key={statusKey} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  {jobStatusLabels[statusKey] || statusKey}
                </p>
                <p className="text-xl font-extrabold text-brand mt-1">{String(count ?? 0)} টি</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-sm text-slate-400 font-medium">
              কোনো কাজের পরিসংখ্যান পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>

      <BlockUserDialog
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        isPending={toggleBlockMutation.isPending}
        isBlocking={!isBlocked}
        onSubmit={(reason) => {
          toggleBlockMutation.mutate(
            { blocked: !isBlocked, reason },
            {
              onSuccess: () => setBlockModalOpen(false),
            }
          );
        }}
      />
    </div>
  );
}