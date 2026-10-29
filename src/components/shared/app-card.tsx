import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AppCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds the hover lift for cards that open something. */
  interactive?: boolean;
  /** Smaller radius and padding. */
  small?: boolean;
};

export function AppCard({ interactive, small, className, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        'border border-slate-100 bg-white shadow-sm',
        small ? 'rounded-2xl p-4' : 'rounded-3xl p-6',
        interactive && 'transition hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
      {...props}
    />
  );
}
