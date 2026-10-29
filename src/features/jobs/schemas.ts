import { z } from "zod";

// Limits from section 8.3 of the guide: description 5 to 500 characters,
// preferredDate from today up to 60 days ahead, sent as YYYY-MM-DD.

export const MAX_DAYS_AHEAD = 60;

/** Local date as YYYY-MM-DD (ASCII digits), the value of <input type="date">. */
export function dateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateLimits(now = new Date()) {
  const latest = new Date(now);
  latest.setDate(latest.getDate() + MAX_DAYS_AHEAD);
  return { min: dateToInputValue(now), max: dateToInputValue(latest) };
}

export const createJobSchema = z.object({
  skill: z.string().min(1, "কাজের ধরন বেছে নিন।"),
  area: z.string().min(1, "এলাকা বেছে নিন।"),
  description: z
    .string()
    .trim()
    .min(5, "কাজের বিবরণ কমপক্ষে ৫ অক্ষর লিখুন।")
    .max(500, "কাজের বিবরণ ৫০০ অক্ষরের বেশি হতে পারবে না।"),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "পছন্দের তারিখ বেছে নিন।")
    .refine((value) => {
      // Checked when the form is validated, so "today" is never stale.
      const { min, max } = getDateLimits();
      return value >= min && value <= max;
    }, "আজ থেকে ৬০ দিনের মধ্যে একটি তারিখ বেছে নিন।"),
  isEmergency: z.boolean(),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
