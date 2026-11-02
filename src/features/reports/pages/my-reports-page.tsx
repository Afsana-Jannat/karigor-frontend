'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, LoaderCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getMyReports } from '../api';
import { reportReasonLabels, reportStatusLabels } from '@/lib/labels';
import { formatDate } from '@/lib/format';

export default function MyReportsPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'mine', page],
    queryFn: () => getMyReports(page),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  const reports = data?.items || [];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand">আমার দাখিলকৃত অভিযোগসমূহ</h1>
        <p className="text-sm text-slate-500 mt-1">আপনার করা অভিযোগ এবং সেগুলোর বর্তমান অবস্থা।</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-14 text-center space-y-3">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">আপনার কোনো অভিযোগ নেই</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div
              key={report.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <span className="font-bold text-slate-800">
                  কারণ: {reportReasonLabels[report.reason as keyof typeof reportReasonLabels] || report.reason}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${report.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : report.status === 'DISMISSED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                >
                  {report.status === 'RESOLVED' && <CheckCircle2 size={14} />}
                  {report.status === 'DISMISSED' && <XCircle size={14} />}
                  {report.status === 'OPEN' && <Clock size={14} />}
                  {reportStatusLabels[report.status as keyof typeof reportStatusLabels] || report.status}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-500">বিবরণ: </span>
                {report.details || 'কোনো বিবরণ দেওয়া হয়নি'}
              </p>

              {report.resolution && (
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-bold">অ্যাডমিনের সিদ্ধান্ত / রেজোলিউশন:</p>
                  <p>{report.resolution}</p>
                </div>
              )}

              <div className="text-xs text-slate-400 pt-1">
                দাখিলের তারিখ: {formatDate(report.createdAt, true)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}