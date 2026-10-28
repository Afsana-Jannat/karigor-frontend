import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

type MoneyProps = {
  /** Integer BDT. */
  amount: number | null | undefined;
  className?: string;
};

export function Money({ amount, className }: MoneyProps) {
  if (amount === null || amount === undefined) return null;
  return <span className={cn('font-bold text-brand', className)}>{formatMoney(amount)}</span>;
}
