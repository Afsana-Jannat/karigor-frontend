'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestApiPage } from '@/lib/apiClient';
import { AdminTable } from '../components/admin-table';
import { ResolveReportDialog } from '../components/resolve-report-dialog';
import { adminKeys } from '../keys';
import type { AdminReportListItem } from '../types';
import { reportReasonLabels } from '@/lib/labels';

export default function AdminReportsPage() {
  const [statusTab, setStatusTab] = React.useState<'OPEN' | 'RESOLVED' | 'DISMISSED'>('OPEN');
  const [page, setPage] = React.useState<number>(1);
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.reports(statusTab, page),
    queryFn: () => requestApiPage<AdminReportListItem>(`/admin/reports?status=${statusTab}&page=${page}`),
  });

  const columns = [
    {
      header: 'অভিযোগকারী ও অভিযুক্ত',
      cell: (item: AdminReportListItem) => (
        <div>
          <p className="font-bold text-slate-900">{item.reporterName}</p>
          <p className="text-xs text-slate-500">বিরুদ্ধে: {item.againstName}</p>
        </div>
      ),
    },
    {
      header: 'কারণ (Reason)',
      cell: (item: AdminReportListItem) => (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
          {reportReasonLabels[item.reason as keyof typeof reportReasonLabels] || item.reason}
        </span>
      ),
    },
    {
      header: 'বিবরণ',
      cell: (item: AdminReportListItem) => (
        <span className="text-xs text-slate-600 line-clamp-2">{item.details || 'কোনো বিবরণ নেই'}</span>
      ),
    },
    {
      header: 'তারিখ',
      cell: (item: AdminReportListItem) => new Date(item.createdAt).toLocaleDateString('bn-BD'),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          অভিযোগ ও সমস্যা পর্যালোচনা (Reports)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          গ্রাহক ও কারিগরদের দাখিলকৃত বিভিন্ন বিরোধ ও অভিযোগের সমাধান
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm w-fit">
        {(['OPEN', 'RESOLVED', 'DISMISSED'] as const).map((tab) => (
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
            {tab === 'OPEN' ? 'খোলা (Open)' : tab === 'RESOLVED' ? 'নিষ্পত্তিকৃত (Resolved)' : 'খারিজকৃত (Dismissed)'}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        emptyMessage="কোনো অভিযোগ পাওয়া যায়নি"
        onRowClick={(item) => {
          if (statusTab === 'OPEN') {
            setSelectedReportId(item.id);
          }
        }}
      />

      <ResolveReportDialog
        reportId={selectedReportId}
        isOpen={!!selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </div>
  );
}