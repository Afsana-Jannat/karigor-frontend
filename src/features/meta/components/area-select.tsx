'use client';

import { useMetaOptions } from '../queries';
import { OptionSelect } from './option-select';

type SelectProps = {
  value?: string;
  onChange: (slug: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  /** Pass the id that <Field> gives its child. */
  id?: string;
};

export function AreaSelect(props: SelectProps) {
  const { areas, isPending } = useMetaOptions();
  return (
    <OptionSelect
      {...props}
      options={areas}
      loading={isPending}
      placeholder="এলাকা বেছে নিন"
      searchPlaceholder="এলাকা খুঁজুন"
      emptyText="কিছু পাওয়া যায়নি"
    />
  );
}
