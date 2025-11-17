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

  return serverFetch<{ items: JobPublic[]; next_cursor?: string | null }>(endpoint, {
    next: {
      revalidate: 3600,
      tags: ["jobs"],
    },
  });
}

export async function getPublicJobServer(jobId: string) {
  return serverFetch<JobPublic>(`/public/jobs/${jobId}`, {
    next: {
      revalidate: 3600,
      tags: ["jobs"],
    },
  });
}

export async function getCategoriesServer() {
  return serverFetch<Category[]>("/categories", {
    next: {
      revalidate: 86400,
      tags: ["categories"],
    },
  });
}

export async function getLocationsServer() {
  const response = await serverFetch<{ locations: AtollLocation[] }>("/public/locations", {
    next: {
      revalidate: 86400,
      tags: ["locations"],
    },
  });
  return response.locations;
}
