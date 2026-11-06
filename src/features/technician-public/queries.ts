"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPublicTechnician,
  getTechnicianReviews,
  searchTechnicians,
  type TechnicianSearch,
} from "./api";

export const technicianPublicKeys = {
  all: ["technicians-public"] as const,
  search: (params: TechnicianSearch) =>
    [...technicianPublicKeys.all, "search", params] as const,
  profile: (id: string) =>
    [...technicianPublicKeys.all, "profile", id] as const,
  reviews: (id: string, page: number, rating?: number) =>
    [...technicianPublicKeys.all, "reviews", id, page, rating] as const,
};

export const useTechnicianSearch = (params: TechnicianSearch) =>
  useQuery({
    queryKey: technicianPublicKeys.search(params),
    queryFn: () => searchTechnicians(params),
    placeholderData: keepPreviousData,
  });

export const usePublicTechnician = (id: string) =>
  useQuery({
    queryKey: technicianPublicKeys.profile(id),
    queryFn: () => getPublicTechnician(id),
    retry: false,
  });

export const useTechnicianReviews = (
  id: string,
  page: number,
  rating?: number,
) =>
  useQuery({
    queryKey: technicianPublicKeys.reviews(id, page, rating),
    queryFn: () => getTechnicianReviews(id, page, rating),
    placeholderData: keepPreviousData,
  });
