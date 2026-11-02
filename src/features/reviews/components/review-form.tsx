'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoaderCircle, Star } from 'lucide-react';
import { reviewSchema, ReviewFormValues } from '../schemas';
import { submitJobReview } from '../api';
import { getErrorMessage } from '@/lib/apiClient';

interface ReviewFormProps {
  jobId: string;
  onDone?: () => void;
}

export function ReviewForm({ jobId, onDone }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = React.useState(0);

  const mutation = useMutation({
    mutationFn: (data: ReviewFormValues) => submitJobReview(jobId, data),
    onSuccess: () => {
      toast.success('আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['technician-reviews'] });
      onDone?.();
    },
    onError: (error) => {

      const message = getErrorMessage(error, {
        CONFLICT: 'আপনি আগেই এই কাজে রিভিউ দিয়েছেন',
      });
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      rating: 5,
      comment: '',
    } as ReviewFormValues,

    validators: {
      onChange: reviewSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto"
    >
      <div>
        <h3 className="text-xl font-extrabold text-brand">কাজটি কেমন লাগল?</h3>
        <p className="text-sm text-slate-500 mt-1">আপনার মূল্যবান মতামত কারিগরের প্রোফাইলে যোগ হবে।</p>
      </div>

      {/* Star Rating Field */}
      <form.Field name="rating">
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">রেটিং দিন</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => field.handleChange(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${(hoverRating || field.state.value) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                      } transition-colors`}
                  />
                </button>
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

      {/* Comment Field */}
      <form.Field name="comment">
        {(field) => (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="আপনার অভিজ্ঞতা সম্পর্কে কিছু বলুন (সর্বোচ্চ ৩০০ অক্ষর)..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
            />
            {field.state.meta.errors ? (
              <p className="text-xs text-red-600 font-medium">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full h-12 rounded-xl bg-brand text-white font-bold shadow-lg shadow-blue-950/10 hover:bg-brand-dark transition flex items-center justify-center gap-2"
      >
        {mutation.isPending && <LoaderCircle size={18} className="animate-spin" />}
        রিভিউ জমা দিন
      </button>
    </form>
  );
}