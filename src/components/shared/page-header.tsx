import type { ReactNode } from 'react';

type PageHeaderProps = {
  /** Small orange label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right side actions (buttons). */
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-bold tracking-wider text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
