import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে'),
});

export const deleteAccountSchema = z.object({
  confirmText: z.string().refine((val) => val === 'DELETE', {
    message: 'অ্যাকাউন্ট ডিলিট করতে ইংরেজিতে "DELETE" লিখতে হবে',
  }),
});

export type UpdateNameValues = z.infer<typeof updateNameSchema>;
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;