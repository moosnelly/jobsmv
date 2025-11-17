"use client";

import React from "react";
import Link from "next/link";
import { JobCard } from "@jobsmv/ui-tripled";
import type { JobPublic } from "@jobsmv/types";
import type { JobPaginationState } from "@/lib/hooks";

interface JobListProps {
  paginationState: JobPaginationState;
  onLoadMore?: () => void;
  className?: string;
}

function JobCardSkeleton() {
  const accentColors = ["peach", "mint", "lilac", "blue"] as const;

  return (
    <div className="job-card job-card--peach animate-pulse">
      {/* Top Section */}
      <div className="job-card__top">
        <div className="job-card__header">
          <div className="job-card__meta">
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>

        <div className="job-card__company">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>

        <div className="job-card__title-row">
          <div className="job-card__title">
            <div className="w-32 h-5 bg-gray-200 rounded mb-1"></div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="job-card__logo">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="job-card__chips">
          <div className="w-12 h-6 bg-gray-200 rounded-full mr-2"></div>
          <div className="w-16 h-6 bg-gray-200 rounded-full mr-2"></div>
          <div className="w-14 h-6 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="job-card__bottom">
        <div className="job-card__info">
          <div className="job-card__salary">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="job-card__location">
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="job-card__details-button">
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-20">
      <div className="mb-6">
        <div className="w-16 h-16 bg-[var(--chip-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          {hasFilters ? "No jobs match your filters" : "No jobs available"}
        </h3>
        <p className="text-muted max-w-md mx-auto">
          {hasFilters
            ? "Try adjusting your search criteria or clearing some filters to see more results."
            : "There are currently no job listings available. Check back later for new opportunities."
          }
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          Something went wrong
        </h3>
        <p className="text-muted max-w-md mx-auto mb-6">
          {error || "We couldn't load the job listings. Please try again."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center h-10 px-6 rounded-pill bg-[var(--cta-solid)] text-[var(--dark-header-text)] text-sm font-semibold hover:bg-[var(--cta-solid-hover)] transition-colors focus-ring"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function JobList({
  paginationState,
  onLoadMore,
  className = ""
}: JobListProps) {
  const { jobs, loading, error, hasNextPage } = paginationState;
  const accentColors = ["peach", "mint", "lilac", "blue"] as const;

  if (error) {
    return <ErrorState error={error} onRetry={onLoadMore} />;
  }

  if (!loading && jobs.length === 0) {
    return <EmptyState hasFilters={false} />; // TODO: Pass actual filter state
  }

  return (
    <div className={className}>
      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {jobs.map((job, index) => {
          const accentColor = accentColors[index % accentColors.length] as "peach" | "mint" | "lilac" | "blue";
          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className="focus-ring">
              <JobCard
                job={job}
                accentColor={accentColor}
                className="hover:scale-[1.02] transition-transform"
              />
            </Link>
          );
        })}

        {/* Loading skeletons */}
        {loading && jobs.length === 0 && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {hasNextPage && !loading && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center justify-center h-12 px-8 rounded-pill bg-[var(--cta-solid)] text-[var(--dark-header-text)] text-sm font-semibold hover:bg-[var(--cta-solid-hover)] transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Jobs"}
          </button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && jobs.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-muted">
            <div className="w-4 h-4 border-2 border-[var(--cta-solid)] border-t-transparent rounded-full animate-spin"></div>
            Loading more jobs...
          </div>
        </div>
      )}
    </div>
  );
}
