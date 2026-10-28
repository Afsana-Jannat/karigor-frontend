'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/apiClient';

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p>{getErrorMessage(error)}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-3 h-11 rounded-xl border-red-200 bg-white font-semibold text-red-700"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          আবার চেষ্টা করুন
        </Button>
      ) : null}
    </div>
  );
}
