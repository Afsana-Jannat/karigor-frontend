import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiClient';
import {
  extractAnswerAudio,
  extractAnswerText,
  getDashboard,
  getMyProfile,
  setAvailability,
  submitVerification,
  upsertProfile,
} from './api';
import { technicianKeys } from './keys';

export const useMyProfile = () =>
  useQuery({
    queryKey: technicianKeys.me(),
    queryFn: getMyProfile,
    retry: false,
    staleTime: 60_000,
  });

export const useDashboard = () =>
  useQuery({
    queryKey: technicianKeys.dashboard(),
    queryFn: getDashboard,
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

export const useUpsertProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: technicianKeys.all });
      toast.success('প্রোফাইল সংরক্ষণ হয়েছে।');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useSetAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setAvailability,
    onSuccess: () => qc.invalidateQueries({ queryKey: technicianKeys.all }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useSubmitVerification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitVerification,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: technicianKeys.all });
      toast.success('যাচাইয়ের আবেদন জমা হয়েছে।');
    },
    onError: (e) =>
      toast.error(
        getErrorMessage(e, {
          CONFLICT: 'আগে প্রোফাইল তৈরি করুন, অথবা যাচাইয়ের আবেদন আগেই জমা হয়েছে।',
          VALIDATION_ERROR: 'এনআইডির ছবি দিন।',
        }),
      ),
  });
};

export const useExtractAnswerText = () =>
  useMutation({ mutationFn: ({ questionKey, text }: { questionKey: string; text: string }) =>
    extractAnswerText(questionKey, text) });

export const useExtractAnswerAudio = () =>
  useMutation({ mutationFn: ({ questionKey, blob, mimeType }: { questionKey: string; blob: Blob; mimeType: string }) =>
    extractAnswerAudio(questionKey, blob, mimeType) });