'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getMetaOptions } from './api';
import { metaKeys } from './keys';

export function useMetaOptions() {
  const query = useQuery({
    queryKey: metaKeys.options(),
    queryFn: getMetaOptions,
    staleTime: Infinity,
  });

  const skillMap = useMemo(
    () => new Map((query.data?.skills ?? []).map((s) => [s.slug, s.bn])),
    [query.data],
  );
  const areaMap = useMemo(
    () => new Map((query.data?.areas ?? []).map((a) => [a.slug, a.bn])),
    [query.data],
  );

  // A slug is never shown. While the options load, or if a slug is unknown,
  // we return an empty string instead of the raw slug.
  const skillName = useCallback((slug: string) => skillMap.get(slug) ?? '', [skillMap]);
  const areaName = useCallback((slug: string) => areaMap.get(slug) ?? '', [areaMap]);

  return {
    ...query,
    skills: query.data?.skills ?? [],
    areas: query.data?.areas ?? [],
    skillName,
    areaName,
  };
}
