'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

type PaginationProps = {
  /** The meta of a requestApiPage response. */
  meta: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav aria-label="পৃষ্ঠা" className="mt-8 flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        className="h-11 rounded-xl border-slate-200 bg-white font-semibold text-brand"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        আগের
      </Button>
      <span className="text-sm text-slate-600">
        {formatNumber(meta.page)} / {formatNumber(meta.totalPages)}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
        className="h-11 rounded-xl border-slate-200 bg-white font-semibold text-brand"
      >
        পরের
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
