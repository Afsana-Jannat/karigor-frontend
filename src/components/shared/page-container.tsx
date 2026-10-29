import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageContainerProps = {
  children: ReactNode;
  /** Forms and detail pages use the narrow width. */
  narrow?: boolean;
  className?: string;
};

export function PageContainer({ children, narrow, className }: PageContainerProps) {
  return (
    <main className="min-h-screen bg-page text-slate-900">
      <div
        className={cn(
          'mx-auto px-5 py-8 sm:px-8 lg:px-12',
          narrow ? 'max-w-3xl' : 'max-w-7xl',
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
