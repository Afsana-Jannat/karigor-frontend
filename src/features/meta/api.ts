import { requestApi } from '@/lib/apiClient';
import type { MetaOptions } from './types';

export const getMetaOptions = () => requestApi<MetaOptions>('meta/options');
