"use cache";

import JobsPageClient from "./JobsPageClient";
import { getCategoriesServer, getPublicJobsServer } from "@/lib/server-api";

export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs", "categories"];

export default async function JobsPage() {
  const [jobsResponse, categories] = await Promise.all([
    getPublicJobsServer(),
    getCategoriesServer(),
  ]);

  const initialPaginationState = {
    jobs: jobsResponse.items ?? [],
    loading: false,
    error: null,
    hasNextPage: Boolean(jobsResponse.next_cursor),
  } as const;

  return (
    <JobsPageClient
      initialCategories={categories}
      initialPaginationState={initialPaginationState}
    />
  );
}
