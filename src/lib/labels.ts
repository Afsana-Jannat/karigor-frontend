export const jobStatusLabels: Record<string, string> = {
  OPEN: "প্রস্তাবের অপেক্ষায়",
  CONTRACT_PENDING: "চুক্তির অপেক্ষায়",
  IN_PROGRESS: "কাজ চলছে",
  AWAITING_CONFIRMATION: "নিশ্চিতকরণের অপেক্ষায়",
  COMPLETED: "সম্পন্ন",
  CANCELLED: "বাতিল",
  DISPUTED: "সমস্যা পর্যালোচনাধীন",
};

export const bidStatusLabels: Record<string, string> = {
  ACTIVE: "সক্রিয়",
  SELECTED: "নির্বাচিত",
  REJECTED: "বাতিল",
  WITHDRAWN: "প্রত্যাহার করা",
};

export const verifyStatusLabels: Record<string, string> = {
  NONE: "যাচাই করা হয়নি",
  PENDING: "যাচাই চলছে",
  VERIFIED: "যাচাইকৃত",
  REJECTED: "প্রত্যাখ্যাত",
};

export const contractStatusLabels: Record<string, string> = {
  PENDING: "স্বাক্ষর বাকি",
  SIGNED: "স্বাক্ষরিত",
  VOID: "বাতিল",
};

export const paymentMethodLabels: Record<string, string> = {
  BKASH: "বিকাশ",
  CASH: "নগদ",
};

export const paymentStatusLabels: Record<string, string> = {
  INITIATED: "শুরু হয়েছে",
  SUCCESS: "সফল",
  FAILED: "ব্যর্থ",
  CANCELLED: "বাতিল",
};

export const reportReasonLabels: Record<string, string> = {
  NO_SHOW: "উপস্থিত হননি",
  POOR_WORK: "কাজ ভালো হয়নি",
  OVERCHARGE: "বেশি টাকা চেয়েছেন",
  FRAUD: "প্রতারণা",
  OTHER: "অন্যান্য",
};

export const reportStatusLabels: Record<string, string> = {
  OPEN: "খোলা",
  RESOLVED: "সমাধান হয়েছে",
  DISMISSED: "খারিজ",
};

export const roleLabels: Record<string, string> = {
  CUSTOMER: "গ্রাহক",
  TECHNICIAN: "কারিগর",
  ADMIN: "অ্যাডমিন",
};

export const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "দেওয়া তথ্যে ভুল আছে। অনুগ্রহ করে ঠিক করুন।",
  OTP_INVALID: "কোডটি সঠিক নয়।",
  OTP_EXPIRED: "কোডের মেয়াদ শেষ হয়ে গেছে। নতুন কোড নিন।",
  UNAUTHENTICATED: "এই নম্বরে কোনো যাচাইকৃত অ্যাকাউন্ট নেই। আগে নিবন্ধন করুন।",
  PAYMENT_FAILED: "পেমেন্ট সম্পন্ন হয়নি।",
  FORBIDDEN: "আপনার এই কাজ করার অনুমতি নেই।",
  NOT_FOUND: "খুঁজে পাওয়া যায়নি।",
  CONFLICT: "এই কাজটি এখন করা যাচ্ছে না।",
  INVALID_STATUS: "এই অবস্থায় এই কাজটি করা যাবে না।",
  RATE_LIMITED: "অনেকবার চেষ্টা করা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  INTERNAL: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  SERVICE_UNAVAILABLE: "সেবা এখন বন্ধ আছে। একটু পরে চেষ্টা করুন।",
  NETWORK: "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
};

export function labelOf(labels: Record<string, string>, key: string): string {
  return labels[key] ?? key;
}