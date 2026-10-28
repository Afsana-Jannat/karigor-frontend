import { labelOf } from '@/lib/labels';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  /** One of the maps from lib/labels.ts, for example jobStatusLabels. */
  labels: Record<string, string>;
  status: string;
  className?: string;
};

// Status is always shown as text. Color is only a hint.
const tone: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700',
  ACTIVE: 'bg-blue-50 text-blue-700',
  CONTRACT_PENDING: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-amber-50 text-amber-700',
  INITIATED: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700',
  AWAITING_CONFIRMATION: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  SIGNED: 'bg-emerald-50 text-emerald-700',
  VERIFIED: 'bg-emerald-50 text-emerald-700',
  SELECTED: 'bg-emerald-50 text-emerald-700',
  RESOLVED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  VOID: 'bg-slate-100 text-slate-600',
  WITHDRAWN: 'bg-slate-100 text-slate-600',
  FAILED: 'bg-red-50 text-red-700',
  REJECTED: 'bg-red-50 text-red-700',
  DISPUTED: 'bg-red-50 text-red-700',
};

export function StatusBadge({ labels, status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        tone[status] ?? 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {labelOf(labels, status)}
    </span>
  );
}
