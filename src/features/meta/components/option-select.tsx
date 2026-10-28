'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { MetaOption } from '../types';

export type OptionSelectProps = {
  options: MetaOption[];
  /** Selected slug, or '' / undefined when nothing is chosen. */
  value?: string;
  onChange: (slug: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
};

// Searchable single select: shadcn Command inside a Popover (69 areas need search).
// base-nova uses Base UI, so the trigger uses the `render` prop and not asChild.
// Open src/components/ui/popover.tsx and command.tsx once to confirm the exports.
export function OptionSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading,
  disabled,
  invalid,
  id,
}: OptionSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.slug === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            disabled={disabled || loading}
            className={cn(
              'h-12 w-full justify-between rounded-xl border-slate-200 bg-white px-4 font-normal',
              !selected && 'text-slate-500',
              invalid && 'border-red-300',
            )}
          />
        }
      >
        <span className="truncate">{loading ? 'লোড হচ্ছে...' : (selected?.bn ?? placeholder)}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.slug}
                  // Search by Bangla and English name, but never show the slug.
                  value={`${option.bn} ${option.en}`}
                  onSelect={() => {
                    onChange(option.slug);
                    setOpen(false);
                  }}
                  className="min-h-11"
                >
                  <Check
                    className={cn('size-4', option.slug === value ? 'opacity-100' : 'opacity-0')}
                    aria-hidden="true"
                  />
                  {option.bn}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
