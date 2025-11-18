import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from './api-client';
import type { JobPublic, SalaryCurrency } from '@jobsmv/types';

export interface JobFilters {
  q?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: SalaryCurrency;
  category?: string;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface JobPaginationState {
  jobs: JobPublic[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  totalJobs?: number;
}

export function useJobFilters(initialState?: Partial<JobPaginationState>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasInitialized = useRef(false);

  const [filters, setFilters] = useState<JobFilters>({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    salary_min: searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined,
    salary_max: searchParams.get('salary_max') ? parseInt(searchParams.get('salary_max')!) : undefined,
    salary_currency: (searchParams.get('salary_currency') as SalaryCurrency) || undefined,
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags')?.split(',') || [],
    sort_by: (searchParams.get('sort_by') as 'created_at' | 'updated_at') || 'created_at',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
  });

  const [paginationState, setPaginationState] = useState<JobPaginationState>({
    jobs: initialState?.jobs ?? [],
    loading: initialState?.loading ?? true,
    error: initialState?.error ?? null,
    hasNextPage: initialState?.hasNextPage ?? false,
  });

  const updateSearchParams = useCallback((newFilters: Partial<JobFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change
    params.delete('cursor');

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateSearchParams(updatedFilters);
  }, [filters, updateSearchParams]);

  const loadJobs = useCallback(async (cursor?: string) => {
    try {
      setPaginationState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.getPublicJobs({
        ...filters,
        cursor,
      });

      setPaginationState(prev => ({
        jobs: cursor ? [...prev.jobs, ...response.items] : response.items,
        loading: false,
        error: null,
        hasNextPage: !!response.next_cursor,
      }));
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setPaginationState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load jobs',
      }));
    }
  }, [filters]);

  const loadNextPage = useCallback(() => {
    if (paginationState.hasNextPage && !paginationState.loading) {
      // For cursor-based pagination, we'd need to track the cursor
      // For now, this is a simplified implementation
      loadJobs();
    }
  }, [paginationState.hasNextPage, paginationState.loading, loadJobs]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // Sync URL parameters to filters state on initial load
  useEffect(() => {
    if (hasInitialized.current) {
      // Only sync on initial load, not on every searchParams change
      return;
    }

    const urlFilters: JobFilters = {
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      salary_min: searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined,
      salary_max: searchParams.get('salary_max') ? parseInt(searchParams.get('salary_max')!) : undefined,
      salary_currency: (searchParams.get('salary_currency') as SalaryCurrency) || undefined,
      category: searchParams.get('category') || '',
      tags: searchParams.get('tags')?.split(',') || [],
      sort_by: (searchParams.get('sort_by') as 'created_at' | 'updated_at') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    setFilters(urlFilters);
  }, []); // Empty dependency array - only run once on mount

  // Load jobs when filters change
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const shouldSkipInitialFetch = Boolean(
        initialState?.jobs && initialState.jobs.length > 0 && initialState.loading === false
      );
      if (shouldSkipInitialFetch) {
        return;
      }
    }

    loadJobs();
  }, [loadJobs]);

  return {
    filters,
    updateFilters,
    clearFilters,
    paginationState,
    loadNextPage,
  };
}
