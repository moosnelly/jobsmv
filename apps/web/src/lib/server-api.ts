import type { JobPublic, Category } from "@jobsmv/types";
import type { AtollLocation } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type ServerFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  cache?: RequestCache;
};

async function serverFetch<T>(endpoint: string, options?: ServerFetchOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: options?.cache,
      next: options?.next,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // During build time or when API is not available, return empty data
    // This allows the build to complete even if the API server is not running
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`API not available during build for ${endpoint}, returning empty data`);
      return [] as T;
    }
    throw error;
  }
}

export async function getPublicJobsServer(params?: {
  cursor?: string;
  q?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: "MVR" | "USD";
}) {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append("cursor", params.cursor);
  if (params?.q) searchParams.append("q", params.q);
  if (params?.location) searchParams.append("location", params.location);
  if (params?.salary_min !== undefined) searchParams.append("salary_min", params.salary_min.toString());
  if (params?.salary_max !== undefined) searchParams.append("salary_max", params.salary_max.toString());
  if (params?.salary_currency) searchParams.append("salary_currency", params.salary_currency);

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/public/jobs?${queryString}` : "/public/jobs";

  return serverFetch<{ items: JobPublic[]; next_cursor?: string | null }>(endpoint);
}

export async function getPublicJobServer(jobId: string) {
  return serverFetch<JobPublic>(`/public/jobs/${jobId}`);
}

export async function getCategoriesServer() {
  return serverFetch<Category[]>("/categories");
}

export async function getLocationsServer() {
  const response = await serverFetch<{ locations: AtollLocation[] }>("/public/locations");
  return response.locations;
}
