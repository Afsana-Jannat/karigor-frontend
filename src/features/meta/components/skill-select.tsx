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

export function SkillSelect(props: SelectProps) {
  const { skills, isPending } = useMetaOptions();
  return (
    <OptionSelect
      {...props}
      options={skills}
      loading={isPending}
      placeholder="কাজের ধরন বেছে নিন"
      searchPlaceholder="কাজ খুঁজুন"
      emptyText="কিছু পাওয়া যায়নি"
    />
  );
}
