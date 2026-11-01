'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestApiPage } from '@/lib/apiClient';
import { AdminTable } from '../components/admin-table';
import { adminKeys } from '../keys';
import type { AdminAuditLogItem } from '../types';

export default function AdminAuditLogsPage() {
  const [action, setAction] = React.useState<string>('');
  const [entityType, setEntityType] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.auditLogs({ action, entityType, page }),
    queryFn: () => {
      const query = new URLSearchParams();
      if (action) query.set('action', action);
      if (entityType) query.set('entityType', entityType);
      query.set('page', String(page));
      return requestApiPage<AdminAuditLogItem>(`/admin/audit-logs?${query.toString()}`);
    },
  });

  const columns = [
    {
      header: 'অ্যাডমিন',
      accessorKey: 'adminName' as const,
      cell: (item: AdminAuditLogItem) => <span className="font-bold text-slate-900">{item.adminName}</span>,
    },
    {
      header: 'অ্যাকশন (Action)',
      cell: (item: AdminAuditLogItem) => (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-brand">
          {item.action}
        </span>
      ),
    },
    {
      header: 'এন্টিটি (Entity)',
      cell: (item: AdminAuditLogItem) => (
        <span className="text-xs font-semibold text-slate-600">
          {item.entityType} #{item.entityId.slice(0, 8)}
        </span>
      ),
    },
    {
      header: 'সময়',
      cell: (item: AdminAuditLogItem) =>
        new Date(item.createdAt).toLocaleString('bn-BD', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          অডিট লগ (Audit Logs)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          অ্যাডমিন প্যানেলে সম্পন্ন করা সকল কার্যক্রমের লগ হিস্ট্রি
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <input
          type="text"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="অ্যাকশন দিয়ে ফিল্টার করুন (যেমন: APPROVE_TECHNICIAN)"
          className="h-11 w-full px-4 rounded-xl border border-slate-200 text-sm outline-none transition focus:border-brand"
        />

        <input
          type="text"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          placeholder="এন্টিটি টাইপ (যেমন: TECHNICIAN, USER)"
          className="h-11 w-full px-4 rounded-xl border border-slate-200 text-sm outline-none transition focus:border-brand"
        />
      </div>

      <AdminTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        emptyMessage="কোনো অডিট লগ পাওয়া যায়নি"
      />
    </div>
  );
}