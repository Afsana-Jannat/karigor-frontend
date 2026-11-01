'use client';

import * as React from 'react';
import {
  Users,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  DollarSign,
  UserPlus,
  LoaderCircle,
  RefreshCw
} from 'lucide-react';
import { useAdminStats } from '../queries';
import { formatMoney } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch, isFetching } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm font-medium text-slate-500">পরিসংখ্যান লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50 text-center">
        <p className="text-sm text-red-700 font-medium">পরিসংখ্যান লোড করতে সমস্যা হয়েছে।</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
            অ্যাডমিন ড্যাশবোর্ড ও পরিসংখ্যান
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Karigor প্ল্যাটফর্মের সামগ্রিক কার্যক্রমের সংক্ষিপ্ত বিবরণ
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-brand font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          রিফ্রেশ করুন
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Paid Amount */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট পরিশোধিত টাকা</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatMoney(stats.totalPaidAmount)}
            </h3>
          </div>
        </div>

        {/* Open Reports */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-accent">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">খোলা অভিযোগসমূহ</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.openReports} টি
            </h3>
          </div>
        </div>

        {/* New Users Last 7 Days */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
            <UserPlus size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">গত ৭ দিনে নতুন ব্যবহারকারী</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.newUsersLast7Days} জন
            </h3>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">ব্যবহারকারীগণ (রোল অনুযায়ী)</h2>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">গ্রাহক (Customer)</span>
              <span className="font-bold text-brand">{stats.usersByRole.CUSTOMER}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">কারিগর (Technician)</span>
              <span className="font-bold text-brand">{stats.usersByRole.TECHNICIAN}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">অ্যাডমিন (Admin)</span>
              <span className="font-bold text-brand">{stats.usersByRole.ADMIN}</span>
            </div>
          </div>
        </div>

        {/* Technicians by Verification Status */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">কারিগর যাচাইকরণ অবস্থা</h2>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">যাচাই চলছে (Pending)</span>
              <span className="font-bold text-amber-600">{stats.techniciansByVerifyStatus.PENDING}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">যাচাইকৃত (Verified)</span>
              <span className="font-bold text-emerald-600">{stats.techniciansByVerifyStatus.VERIFIED}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">প্রত্যাখ্যাত (Rejected)</span>
              <span className="font-bold text-red-600">{stats.techniciansByVerifyStatus.REJECTED}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-semibold text-slate-600">আবেদন করেননি (None)</span>
              <span className="font-bold text-slate-600">{stats.techniciansByVerifyStatus.NONE}</span>
            </div>
          </div>
        </div>

        {/* Jobs by Status */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 lg:col-span-1 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-accent">
              <Briefcase size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">কাজের অবস্থা (Job Status)</h2>
          </div>
          <div className="space-y-2 pt-2 max-h-64 overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">প্রস্তাবের অপেক্ষায় (OPEN)</span>
              <span className="font-bold text-slate-800">{stats.jobsByStatus.OPEN}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">চুক্তির অপেক্ষায় (CONTRACT_PENDING)</span>
              <span className="font-bold text-slate-800">{stats.jobsByStatus.CONTRACT_PENDING}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">কাজ চলছে (IN_PROGRESS)</span>
              <span className="font-bold text-slate-800">{stats.jobsByStatus.IN_PROGRESS}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">নিশ্চিতকরণের অপেক্ষায় (AWAITING_CONFIRMATION)</span>
              <span className="font-bold text-slate-800">{stats.jobsByStatus.AWAITING_CONFIRMATION}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">সম্পন্ন (COMPLETED)</span>
              <span className="font-bold text-emerald-600">{stats.jobsByStatus.COMPLETED}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">বাতিল (CANCELLED)</span>
              <span className="font-bold text-slate-500">{stats.jobsByStatus.CANCELLED}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">সমস্যা পর্যালোচনাধীন (DISPUTED)</span>
              <span className="font-bold text-red-600">{stats.jobsByStatus.DISPUTED}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}