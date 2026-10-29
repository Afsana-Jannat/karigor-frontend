export type MyProfile = {
  name: string;
  phone: string;
  age: number;
  bio: string | null;
  experienceYears: number;
  skills: string[];
  areas: string[];
  rateMin: number | null;
  rateMax: number | null;
  isAvailableNow: boolean;
  photoUrl: string | null;
  verifyStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectReason: string | null;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
};

export type ExtractResult = {
  questionKey: string;
  transcript: string | null;
  value: number | string[] | { rateMin: number; rateMax: number } | null;
  unmatched: string[];
  usedAi: boolean;
};

export type DashboardData = {
  counts: {
    newJobs: number;
    activeBids: number;
    awaitingSignature: number;
    active: number;
    completed: number;
    disputed: number;
  };
  earnings: {
    total: number;
    last30Days: number;
  };
  rating: {
    avg: number;
    count: number;
  };
  verifyStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  isAvailableNow: boolean;
  recentReviews: {
    rating: number;
    comment: string | null;
    createdAt: string;
  }[];
};