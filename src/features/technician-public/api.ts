import { requestApi, requestApiPage } from "@/lib/apiClient";

export type PublicTechnician = {
  id: string;
  name: string;
  photoUrl: string | null;
  verified: boolean;
  isAvailableNow: boolean;
  age: number;
  experienceYears: number;
  rateMin: number | null;
  rateMax: number | null;
  skills: string[];
  areas: string[];
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
};

export type TechnicianReview = {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
};

export type PublicTechnicianProfile = PublicTechnician & {
  bio: string | null;
  profileUrl: string;
};

export type TechnicianReviews = {
  summary: {
    ratingAvg: number;
    ratingCount: number;
    distribution: Record<string, number>;
  };
  reviews: TechnicianReview[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export type TechnicianSearch = {
  skill?: string;
  area?: string;
  q?: string;
  verifiedOnly?: boolean;
  availableNow?: boolean;
  minRating?: number;
  maxRate?: number;
  sort?: "relevance" | "rating" | "experience" | "rate";
  page?: number;
  pageSize?: number;
};

function queryString(
  params: Record<string, string | number | boolean | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const searchTechnicians = (params: TechnicianSearch) =>
  requestApiPage<PublicTechnician>(`technicians${queryString(params)}`);

export const getPublicTechnician = (id: string) =>
  requestApi<PublicTechnicianProfile>(`technicians/${encodeURIComponent(id)}`);

export const getTechnicianReviews = (id: string, page = 1, rating?: number) =>
  requestApi<TechnicianReviews>(
    `technicians/${encodeURIComponent(id)}/reviews${queryString({ page, pageSize: 10, rating })}`,
  );

export const parseSearchQuery = (query: string) =>
  requestApi<{
    skill: string | null;
    area: string | null;
    isEmergency: boolean;
    usedAi: boolean;
  }>("search/parse-query", {
    method: "POST",
    body: { query },
  });
