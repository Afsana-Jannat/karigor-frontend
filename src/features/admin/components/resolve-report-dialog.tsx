'use client';

import * as React from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { useResolveReport } from '../queries';

interface ResolveReportDialogProps {
  reportId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResolveReportDialog({ reportId, isOpen, onClose }: ResolveReportDialogProps) {
  const [decision, setDecision] = React.useState<'COMPLETE' | 'CANCEL' | 'DISMISS'>('COMPLETE');
  const [resolution, setResolution] = React.useState('');
  const [error, setError] = React.useState('');

  const resolveMutation = useResolveReport(reportId || '');

  if (!isOpen || !reportId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolution.trim().length < 5) {
      setError('রেজোলিউশন বিবরণ অন্তত ৫ অক্ষরের হতে হবে।');
      return;
    }
    if (resolution.trim().length > 300) {
      setError('রেজোলিউশন বিবরণ ৩০০ অক্ষরের মধ্যে হতে হবে।');
      return;
    }
    setError('');
    resolveMutation.mutate(
      { decision, resolution: resolution.trim() },
      {
        onSuccess: () => {
          onClose();
          setResolution('');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">অভিযোগ নিষ্পত্তি করুন (Resolve Report)</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">সিদ্ধান্ত (Decision)</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand"
            >
              <option value="COMPLETE">সম্পন্ন ঘোষণা করুন (COMPLETE)</option>
              <option value="CANCEL">কাজ বাতিল করুন (CANCEL)</option>
              <option value="DISMISS">অভিযোগ খারিজ করুন (DISMISS)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              রেজোলিউশন বিবরণ (৫ থেকে ৩০০ অক্ষর)
            </label>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="সিদ্ধান্তের কারণ বা বিবরণ লিখুন..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={resolveMutation.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={resolveMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition disabled:opacity-50 shadow-md shadow-blue-950/10"
            >
              {resolveMutation.isPending && <LoaderCircle size={16} className="animate-spin" />}
              নিষ্পত্তি নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}