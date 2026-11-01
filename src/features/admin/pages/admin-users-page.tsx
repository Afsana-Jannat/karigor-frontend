'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAdminUsers } from '../queries';
import { AdminTable } from '../components/admin-table';
import { roleLabels } from '@/lib/labels';

export default function AdminUsersPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);

  // Debounce search input (400ms)[cite: 147]
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    q: debouncedQuery || undefined,
    page,
  });

  const columns = [
    {
      header: 'নাম ও ফোন',
      cell: (item: any) => (
        <div>
          <p className="font-bold text-slate-900">{item.name}</p>
          <p className="text-xs font-mono text-slate-500">{item.phone}</p>
        </div>
      ),
    },
    {
      header: 'রোল (Role)',
      cell: (item: any) => (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand">
          {roleLabels[item.role as keyof typeof roleLabels] || item.role}
        </span>
      ),
    },
    {
      header: 'স্ট্যাটাস',
      cell: (item: any) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700'
              : item.status === 'BLOCKED'
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-600'
            }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: 'নিবন্ধনের তারিখ',
      cell: (item: any) =>
        new Date(item.createdAt).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          ব্যবহারকারী ব্যবস্থাপনা
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          সকল গ্রাহক, কারিগর ও অ্যাডমিনগণের তালিকা এবং তথ্য অনুসন্ধান
        </p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            className="h-11 w-full pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
          />
        </div>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand"
        >
          <option value="">সকল রোল (All Roles)</option>
          <option value="CUSTOMER">গ্রাহক (Customer)</option>
          <option value="TECHNICIAN">কারিগর (Technician)</option>
          <option value="ADMIN">অ্যাডমিন (Admin)</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand"
        >
          <option value="">সকল স্ট্যাটাস (All Status)</option>
          <option value="ACTIVE">সক্রিয় (Active)</option>
          <option value="BLOCKED">ব্লকড (Blocked)</option>
          <option value="DELETED">ডিলেটেড (Deleted)</option>
        </select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        emptyMessage="কোনো ব্যবহারকারী পাওয়া যায়নি"
        onRowClick={(item) => router.push(`/admin/users/${item.id}`)}
      />
    </div>
  );
}