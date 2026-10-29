import { z } from "zod";

// Section 8.3: an OTP is exactly 6 digits. The input already turns Bangla
// digits into ASCII digits, so the schema only checks the result.
export const signOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "৬ সংখ্যার কোড লিখুন।"),
});

export type SignOtpFormValues = z.infer<typeof signOtpSchema>;
