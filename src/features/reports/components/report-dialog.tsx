'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoaderCircle, AlertTriangle, X } from 'lucide-react';
import { reportSchema, ReportFormValues } from '../schemas';
import { submitJobReport } from '../api';
import { getErrorMessage } from '@/lib/apiClient';
import { reportReasonLabels } from '@/lib/labels';

interface ReportDialogProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDialog({ jobId, isOpen, onClose }: ReportDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ReportFormValues) => submitJobReport(jobId, data),
    onSuccess: () => {
      toast.success('অভিযোগটি সফলভাবে জমা দেওয়া হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['reports', 'mine'] });
      onClose();
    },
    onError: (error) => {
      const message = getErrorMessage(error, {
        CONFLICT: 'আপনি এই কাজে আগেই একটি ওপেন অভিযোগ করেছেন',
      });
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      reason: 'OTHER',
      details: '',
    } as ReportFormValues,
    validators: {
      onChange: reportSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={22} />
            <h3 className="text-lg font-extrabold text-slate-900">অভিযোগ দাখিল করুন</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Reason Select (Radio/Select options) */}
          <form.Field name="reason">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">সমস্যার কারণ</label>
                <div className="space-y-2">
                  {Object.entries(reportReasonLabels).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer ${field.state.value === key
                          ? 'border-brand bg-blue-50/50 text-brand font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={key}
                        checked={field.state.value === key}
                        onChange={() => field.handleChange(key as any)}
                        className="text-brand focus:ring-brand"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                {field.state.meta.errors ? (
                  <p className="text-xs text-red-600 font-medium">
                    {field.state.meta.errors.join(', ')}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Details Field */}
          <form.Field name="details">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ঘটনাটি সম্পর্কে বিস্তারিত লিখুন (সর্বোচ্চ ৫০০ অক্ষর)..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
                />
                {field.state.meta.errors ? (
                  <p className="text-xs text-red-600 font-medium">
                    {field.state.meta.errors.join(', ')}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-950/10 hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              {mutation.isPending && <LoaderCircle size={18} className="animate-spin" />}
              অভিযোগ পাঠান
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}