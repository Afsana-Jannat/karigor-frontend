'use client';

import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Extra content, for example an optional reason field. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shows the spinner and disables both buttons. */
  pending?: boolean;
  /** Use for cancel, delete and block. */
  destructive?: boolean;
  onConfirm: () => void;
};

// Controlled dialog: the screen owns `open`, so no trigger or asChild is needed.
// Check src/components/ui/alert-dialog.tsx after `shadcn add` in case a name differs.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'নিশ্চিত করুন',
  cancelLabel = 'ফিরে যান',
  pending,
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} className="h-11 rounded-xl">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              destructive
                ? 'h-11 rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700'
                : 'h-11 rounded-xl bg-brand px-5 font-bold text-white hover:bg-brand-dark'
            }
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
