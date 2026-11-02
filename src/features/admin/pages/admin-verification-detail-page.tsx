
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, LoaderCircle } from 'lucide-react';
import { useAdminVerificationDetail, useApproveTechnician, useRejectTechnician } from '../queries';
import { VerificationDialog } from '../components/verification-dialog';
import { verifyStatusLabels } from '@/lib/labels';

export default function AdminVerificationDetailPage({ technicianId }: { technicianId: string }) {
  const router = useRouter();
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);

  const { data: detail, isLoading, refetch, isFetching } = useAdminVerificationDetail(technicianId);
  const approveMutation = useApproveTechnician(technicianId);
  const rejectMutation = useRejectTechnician(technicianId);
  console.log(detail, "tt");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-500 font-medium">তথ্য পাওয়া যায়নি</p>
      </div>
    );
  }


  const technicianName = detail.user?.name || detail.name || 'অজ্ঞাত কারিগর';
  const technicianPhone = detail.user?.phone || detail.phone || 'ফোন নম্বর নেই';
  const technicianPhoto = detail.photoUrl || detail.user?.photoUrl;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand transition"
      >
        <ArrowLeft size={16} /> পেছনে ফিরে যান
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-xl text-slate-600">
            {technicianPhoto ? (
              <img src={technicianPhoto} alt={technicianName} className="size-full object-cover" />
            ) : (
              technicianName.charAt(0) || '?'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand">{technicianName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{technicianPhone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {verifyStatusLabels[detail.verifyStatus as keyof typeof verifyStatusLabels] || detail.verifyStatus}
          </span>
        </div>
      </div>

      {/* Profile summary details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">প্রোফাইল তথ্য</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-slate-500">বয়স:</span> {detail.age ?? 'নেই'} বছর</p>
            <p><span className="font-semibold text-slate-500">অভিজ্ঞতা:</span> {detail.experienceYears ?? 'নেই'} বছর</p>
            <p><span className="font-semibold text-slate-500">বায়ো:</span> {detail.bio || 'নেই'}</p>
            <p><span className="font-semibold text-slate-500">দক্ষতা:</span> {detail.skills?.length ? detail.skills.join(', ') : 'নেই'}</p>
            <p><span className="font-semibold text-slate-500">এলাকা:</span> {detail.areas?.length ? detail.areas.join(', ') : 'নেই'}</p>
          </div>
        </div>

        {/* NID Private Image View */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-bold text-slate-900">এনআইডি কার্ডের ছবি</h3>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> লিংক রিফ্রেশ করুন
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2 min-h-55">
            {detail.nidUrl ? (
              <img
                src={detail.nidUrl}
                alt="NID Document"
                className="max-h-72 rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">এনআইডি ছবি পাওয়া যায়নি</p>
            )}
          </div>
          <p className="text-xs text-slate-400">সতর্কতা: এই প্রাইভেট এনআইডি লিংকটি প্রায় ৫ মিনিট পর মেয়াদোত্তীর্ণ হয়ে যায়।</p>
        </div>
      </div>

      {/* Action Buttons (Only when PENDING) */}
      {detail.verifyStatus === 'PENDING' && (
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => rejectModalOpen || setRejectModalOpen(true)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="flex-1 py-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <XCircle size={18} /> প্রত্যাখ্যান করুন
          </button>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/10"
          >
            {approveMutation.isPending ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            অনুমোদন করুন
          </button>
        </div>
      )}

      <VerificationDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        isPending={rejectMutation.isPending}
        onSubmit={(reason) => {
          rejectMutation.mutate(reason, {
            onSuccess: () => {
              setRejectModalOpen(false);
              router.push('/admin/verifications');
            },
          });
        }}
      />
    </div>
  );
}