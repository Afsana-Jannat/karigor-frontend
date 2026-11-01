'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { requestApiPage } from '@/lib/apiClient';
import { AdminTable } from '../components/admin-table';
import { jobStatusLabels } from '@/lib/labels';
import { formatMoney } from '@/lib/format';
import type { AdminJobListItem } from '../types';
import { adminKeys } from '../keys';

export default function AdminJobsPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<string>('');
  const [skill, setSkill] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.jobs({ status, skill, page }),
    queryFn: () => {
      const query = new URLSearchParams();
      if (status) query.set('status', status);
      if (skill) query.set('skill', skill);
      query.set('page', String(page));
      return requestApiPage<AdminJobListItem>(`/admin/jobs?${query.toString()}`);
    },
  });

  const columns = [
    {
      header: 'কাজের বিবরণ ও এলাকা',
      cell: (item: AdminJobListItem) => (
        <div>
          <p className="font-bold text-slate-900">{item.skill} ({item.area})</p>
          <p className="text-xs text-slate-500">গ্রাহক: {item.customerName}</p>
        </div>
      ),
    },
    {
      header: 'স্ট্যাটাস',
      cell: (item: AdminJobListItem) => (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {jobStatusLabels[item.status as keyof typeof jobStatusLabels] || item.status}
        </span>
      ),
    },
    {
      header: 'নির্ধারিত মূল্য',
      cell: (item: AdminJobListItem) => item.agreedPrice ? formatMoney(item.agreedPrice) : 'নির্ধারিত হয়নি',
    },
    {
      header: 'কারিগর',
      cell: (item: AdminJobListItem) => item.technicianName || 'নেই',
    },
    {
      header: 'তারিখ',
      cell: (item: AdminJobListItem) => new Date(item.createdAt).toLocaleDateString('bn-BD'),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          সকল কাজ (Jobs Management)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ప్ল্যাটফর্মে পোস্টকৃত সকল কাজের তালিকা এবং ফিল্টার
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand"
        >
          <option value="">সকল স্ট্যাটাস (All Status)</option>
          <option value="OPEN">প্রস্তাবের অপেক্ষায় (OPEN)</option>
          <option value="CONTRACT_PENDING">চুক্তির অপেক্ষায়</option>
          <option value="IN_PROGRESS">কাজ চলছে</option>
          <option value="AWAITING_CONFIRMATION">নিশ্চিতকরণের অপেক্ষায়</option>
          <option value="COMPLETED">সম্পন্ন</option>
          <option value="CANCELLED">বাতিল</option>
          <option value="DISPUTED">সমস্যা পর্যালোচনাধীন (Disputed)</option>
        </select>

        <input
          type="text"
          value={skill}
          onChange={(e) => {
            setSkill(e.target.value);
            setPage(1);
          }}
          placeholder="দক্ষতা স্লগ (যেমন: ac_repair) দিয়ে ফিল্টার করুন"
          className="h-11 w-full px-4 rounded-xl border border-slate-200 text-sm outline-none transition focus:border-brand"
        />
      </div>

      <AdminTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        emptyMessage="কোনো কাজ পাওয়া যায়নি"
        onRowClick={(item) => router.push(`/jobs/${item.id}`)}
      />
    </div>
  );
}