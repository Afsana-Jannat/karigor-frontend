import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'কমপক্ষে ১ স্টার দিতে হবে').max(5, 'সর্বোচ্চ ৫ স্টার দেওয়া যাবে'),
  comment: z.string().max(300, 'মন্তব্য সর্বোচ্চ ৩০০ অক্ষরের মধ্যে হতে হবে').optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;