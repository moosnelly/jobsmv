"use client";

import { useEffect, useState } from "react";
import {
  SearchIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
  UserIcon,
  BellIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import type { Category } from "@jobsmv/types";
import type { JobPaginationState } from "@/lib/hooks";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useJobFilters } from "@/lib/hooks";
import UserDropdown from "@/components/UserDropdown";
import LocationDropdown from "@/components/LocationDropdown";
import ProfileSettingsPanel from "@/components/ProfileSettingsPanel";
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
      {/* Dark Navigation Header - Same as Home Page */}
      <header className="bg-[var(--dark-header-bg)] text-[var(--dark-header-text)] border-b border-[var(--dark-header-border)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--dark-header-text)] flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 text-[var(--dark-header-bg)]" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                JobsMv
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <Link
                href="/"
                className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
              >
                Find job
              </Link>
              <Link
                href="#messages"
                className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
              >
                Messages
              </Link>
              <Link
                href="#hiring"
                className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
              >
                Hiring
              </Link>
              <Link
                href="#community"
                className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
              >
                Community
              </Link>
              <Link
                href="#faq"
                className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
              >
                FAQ
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <LocationDropdown
                selectedLocation={filters.location || null}
                onChange={(location) => updateFilters({ location: location || undefined })}
              />
              <UserDropdown />
              {isAuthenticated() && (
                <button
                  onClick={() => setShowSettingsPanel(true)}
                  className="icon-button !bg-[var(--dark-header-control-bg)] !border-[var(--dark-header-control-border)] text-[var(--dark-header-text)] hover:!bg-[var(--dark-header-control-hover)] focus-ring"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              )}
              <button
                className="icon-button !bg-[var(--dark-header-control-bg)] !border-[var(--dark-header-control-border)] text-[var(--dark-header-text)] hover:!bg-[var(--dark-header-control-hover)] focus-ring"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toolbar - Quick Filters */}
          <div className="py-3 border-t border-[var(--dark-header-border)]">
            <div className="flex items-center gap-3 overflow-x-auto">
              {/* Quick Search */}
              <div className="flex items-center gap-2 px-4 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] min-w-[200px]">
                <SearchIcon className="w-4 h-4 text-[var(--dark-header-text-muted)] flex-shrink-0" />
                <input
                  type="text"
                  value={filters.q || ""}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                  placeholder="Job title, company, keywords"
                  aria-label="Search jobs"
                  className="flex-1 bg-transparent text-[var(--dark-header-text)] placeholder:text-[var(--dark-header-text-muted)] outline-none text-sm focus-ring"
                />
              </div>

              {/* Quick Location Filter */}
              <div className="relative">
                <label htmlFor="quick-location" className="sr-only">Location</label>
                <select
                  id="quick-location"
                  value={filters.location || ""}
                  onChange={(e) => updateFilters({ location: e.target.value || undefined })}
                  className="flex items-center gap-2 pl-10 pr-8 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                >
                  <option value="">Any location</option>
                  <option value="maldives">Maldives</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
              </div>

              {/* Salary Currency Quick Filter */}
              <div className="relative">
                <label htmlFor="quick-currency" className="sr-only">Salary currency</label>
                <select
                  id="quick-currency"
                  value={filters.salary_currency || ""}
                  onChange={(e) => updateFilters({ salary_currency: e.target.value as any || undefined })}
                  className="flex items-center gap-2 pl-10 pr-8 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                >
                  <option value="">Any currency</option>
                  <option value="MVR">MVR</option>
                  <option value="USD">USD</option>
                </select>
                <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </header>

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
            <div className="sticky top-[200px]">
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
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-[var(--cta-solid)] transition-colors focus-ring"
                  aria-label="Sort by last updated"
                >
                  Newest
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
