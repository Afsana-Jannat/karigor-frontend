'use client';

import * as React from 'react';
import { LoaderCircle, X } from 'lucide-react';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isPending: boolean;
  isBlocking: boolean; // true হলে ব্লক, false হলে আনব্লক
}

export function BlockUserDialog({ isOpen, onClose, onSubmit, isPending, isBlocking }: BlockUserDialogProps) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('কারণ অন্তত ৫ অক্ষরের হতে হবে।');
      return;
    }
    if (reason.trim().length > 200) {
      setError('কারণ ২০০ অক্ষরের মধ্যে হতে হবে।');
      return;
    }
    setError('');
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {isBlocking ? 'ব্যবহারকারীকে ব্লক করুন' : 'ব্যবহারকারীর ব্লক তুলে নিন'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              কারণ লিখুন (৫ থেকে ২০০ অক্ষর)
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="যেমন: নিয়ম লঙ্ঘন করার কারণে..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-50 ${isBlocking ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-dark'
                }`}
            >
              {isPending && <LoaderCircle size={16} className="animate-spin" />}
              নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}