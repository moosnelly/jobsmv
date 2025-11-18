"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import type { Category } from "@jobsmv/types";
import type { JobPaginationState } from "@/lib/hooks";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useJobFilters } from "@/lib/hooks";
import ProfileSettingsPanel from "@/components/ProfileSettingsPanel";
import Header from "@/components/Header";
import { JobFiltersPanel } from "@/components/JobFiltersPanel";
import { JobList } from "@/components/JobList";

interface JobsPageClientProps {
  initialCategories?: Category[];
  initialPaginationState?: Partial<JobPaginationState>;
}

export default function JobsPageClient({
  initialCategories,
  initialPaginationState,
}: JobsPageClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const { isAuthenticated } = useAuth();

  // Job filtering and pagination logic
  const {
    filters,
    updateFilters,
    clearFilters,
    paginationState,
    loadNextPage,
  } = useJobFilters(initialPaginationState);

  // Toggle sort between newest (created_at) and recently updated (updated_at)
  const toggleSort = () => {
    const newSortBy = filters.sort_by === 'created_at' ? 'updated_at' : 'created_at';
    updateFilters({ sort_by: newSortBy, sort_order: 'desc' });
  };

  // Get the current sort label
  const getSortLabel = () => {
    return filters.sort_by === 'created_at' ? 'Newest' : 'Recently Updated';
  };

  // Load categories only if not provided as initial prop
  useEffect(() => {
    if (categories.length === 0) {
      async function loadCategories() {
        try {
          const categoriesData = await apiClient.getCategories();
          setCategories(categoriesData || []);
        } catch (error) {
          console.error("Failed to load categories:", error);
        }
      }
      loadCategories();
    }
  }, [categories.length]);

  return (
    <div className="min-h-screen bg-app">
      <Header
        showFilters={true}
        searchQuery={filters.q}
        onSearchChange={(value) => updateFilters({ q: value })}
        selectedLocation={filters.location || null}
        onLocationChange={(location) => updateFilters({ location: location || undefined })}
        salaryCurrency={filters.salary_currency}
        onSalaryCurrencyChange={(currency) => updateFilters({ salary_currency: currency || undefined })}
        onShowSettingsPanel={() => setShowSettingsPanel(true)}
      />

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar - Comprehensive Filters */}
          <aside className="space-y-6">
            {/* Promotional Card */}
            <div className="sticky top-8 bg-[var(--dark-header-bg)] text-[var(--dark-header-text)] rounded-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cta-solid)] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-accent-card-3)] rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h3
                  className="text-xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Find Your Perfect Job Match
                </h3>
                <p className="text-sm text-[var(--dark-header-text-muted)] mb-4">
                  Use our advanced filters to discover opportunities that match your skills and preferences.
                </p>
                <button className="button-cta w-full">
                  Browse Categories
                </button>
              </div>
            </div>

            {/* Comprehensive Filters Panel */}
            <div className="sticky top-[200px] mt-6">
              <JobFiltersPanel
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
                categories={categories}
              />
            </div>
          </aside>

          {/* Right Side - Job Listings */}
          <main>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  All Jobs
                </h1>
                <p className="text-sm text-muted">
                  {paginationState.jobs.length > 0 ? (
                    <>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--chip-bg)] text-primary text-xs font-bold mr-2">
                        {paginationState.jobs.length}
                      </span>
                      {paginationState.jobs.length === 1 ? "job found" : "jobs found"}
                    </>
                  ) : (
                    "Find your next opportunity"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Sort by:</span>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-[var(--cta-solid)] transition-colors focus-ring"
                  aria-label={`Sort by ${getSortLabel().toLowerCase()}`}
                >
                  {getSortLabel()}
                  <SlidersHorizontalIcon className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Job List */}
            <JobList
              paginationState={paginationState}
              onLoadMore={loadNextPage}
            />
          </main>
        </div>
      </div>

      {/* Profile Settings Panel */}
      <ProfileSettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
    </div>
  );
}
