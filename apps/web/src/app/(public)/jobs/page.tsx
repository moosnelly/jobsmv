import { Suspense } from "react";
import JobsPageClient from "./JobsPageClient";
import { getCategoriesServer, getPublicJobsServer } from "@/lib/server-api";

export default async function JobsPage() {
  try {
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
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading jobs...</div>
        </div>
      }>
        <JobsPageClient
          initialCategories={categories}
          initialPaginationState={initialPaginationState}
        />
      </Suspense>
    );
  } catch (error) {
    // Fallback when API is not available - return simple error state
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Jobs</h1>
          <p className="text-gray-600">Unable to load jobs at this time. Please try again later.</p>
        </div>
      </div>
    );
  }
}
