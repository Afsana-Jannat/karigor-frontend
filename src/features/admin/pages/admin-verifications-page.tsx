'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAdminVerifications } from '../queries';
import { AdminTable } from '../components/admin-table';
import { verifyStatusLabels } from '@/lib/labels';

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [statusTab, setStatusTab] = React.useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useAdminVerifications(statusTab, page);
  console.log(data, "datassssss");

  const columns = [
    {
      header: 'কারিগর নাম',
      accessorKey: 'name' as const,
      cell: (item: any) => {
        const technicianName = item.user?.name || item.name || 'অজ্ঞাত কারিগর';
        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-600">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt={technicianName} className="size-full object-cover" />
              ) : (
                technicianName.charAt(0) || '?'
              )}
            </div>
            <span className="font-bold text-slate-900">{technicianName}</span>
          </div>
        );
      },
    },
    {
      header: 'জমা দেওয়ার সময়',
      cell: (item: any) => {

        const dateValue = item.submittedAt || item.createdAt;
        return dateValue ? new Date(dateValue).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) : 'তারিখ নেই';
      },
    },
    {
      header: 'অবস্থা',
      cell: (item: any) => (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {verifyStatusLabels[item.verifyStatus as keyof typeof verifyStatusLabels] || item.verifyStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          কারিগর যাচাইকরণ সারি
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          কারিগরদের এনআইডি ও ছবি যাচাই এবং অনুমোদন বা প্রত্যাখ্যান করুন
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm w-fit">
        {(['PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusTab(tab);
              setPage(1);
            }}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition ${statusTab === tab
              ? 'bg-brand text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {tab === 'PENDING' ? 'যাচাই চলছে (Pending)' : tab === 'VERIFIED' ? 'যাচাইকৃত (Verified)' : 'প্রত্যাখ্যাত (Rejected)'}
          </button>
        ))}
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        emptyMessage="কোনো যাচাইকরণ আবেদন নেই"
        onRowClick={(item: any) => {

          const techId = item.userId || item.id || item.user?.id;
          if (techId) {
            router.push(`/admin/verifications/${techId}`);
          } else {
            console.error("ID not found in item:", item);
          }
        }}
      />
    </div>
  );
}