import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = 'লোড হচ্ছে...', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex items-center justify-center py-14', className)}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="size-6 animate-spin text-brand" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
