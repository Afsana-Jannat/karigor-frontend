import { z } from 'zod';

export const reportSchema = z.object({
  reason: z.enum(['NO_SHOW', 'POOR_WORK', 'OVERCHARGE', 'FRAUD', 'OTHER'], {
    message: 'অনুগ্রহ করে একটি কারণ নির্বাচন করুন',
  }),
  details: z.string().max(500, 'বিস্তারিত বিবরণ সর্বোচ্চ ৫০০ অক্ষরের মধ্যে হতে হবে').optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;