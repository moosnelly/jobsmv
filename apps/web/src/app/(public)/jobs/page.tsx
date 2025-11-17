"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { JobCard, FiltersPanel } from "@jobsmv/ui-tripled";
import type { JobPublic, Category, SalaryCurrency } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";

/**
 * Currency Filter Flow Documentation (✅ FIXED)
 *
 * 1. UI Selection: User selects MVR/USD from currency dropdown in FiltersPanel component
 * 2. State Management: Selected currency stored in component state as SalaryCurrency type
 * 3. API Serialization: Currency passed as 'salary_currency' query param to getPublicJobs()
 * 4. Backend Processing: FastAPI endpoint accepts salary_currency param and filters jobs
 * 5. Database Query: Jobs filtered to show only those with at least one salary in selected currency
 *
 * Expected Behavior (✅ IMPLEMENTED):
 * - No currency selected → Show all jobs (salary_currency not sent to API)
 * - MVR selected → Show only jobs with MVR salaries
 * - USD selected → Show only jobs with USD salaries
 *
 * Implementation Details:
 * - FiltersPanel component includes currency dropdown with "All Currencies", "MVR", "USD" options
 * - Backend uses subquery to find jobs with salaries in the selected currency
 * - Type-safe with SalaryCurrency type alias for consistency across frontend/backend
 */

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    category?: string;
    location?: string;
    search?: string;
    currency?: SalaryCurrency;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsData, categoriesData] = await Promise.all([
          apiClient.getPublicJobs(),
          apiClient.getCategories(),
        ]);
        setJobs(jobsData.items);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilterChange = async (newFilters: {
    category?: string;
    location?: string;
    search?: string;
    currency?: SalaryCurrency;
  }) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const jobsData = await apiClient.getPublicJobs({
        q: newFilters.search,
        location: newFilters.location,
        salary_currency: newFilters.currency,
      });
      setJobs(jobsData.items);
    } catch (error) {
      console.error("Failed to filter jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <p className="mt-2 text-gray-600">Find your next opportunity</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <FiltersPanel
              categories={categories.map((cat) => ({
                value: cat.id,
                label: cat.name || "",
              }))}
              locations={[
                { value: "remote", label: "Remote" },
                { value: "new-york", label: "New York, NY" },
                { value: "san-francisco", label: "San Francisco, CA" },
              ]}
              selectedCurrency={filters.currency}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  const accentColors = ["peach", "mint", "lilac", "blue"] as const;
                  const accentColor = accentColors[index % accentColors.length] as "peach" | "mint" | "lilac" | "blue";
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="focus-ring">
                      <JobCard job={job} accentColor={accentColor} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

