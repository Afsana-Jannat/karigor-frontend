import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: LucideIcon;
  text: string;
  /** One next step: a Link-styled button or a Button. */
  action?: ReactNode;
};

export function EmptyState({ icon: Icon = Inbox, text, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <Icon className="mx-auto size-10 text-slate-400" aria-hidden="true" />
      <p className="mt-4 text-slate-600">{text}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
