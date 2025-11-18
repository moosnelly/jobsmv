"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { UserIcon, CalendarIcon } from "lucide-react";

export interface RecentApplicant {
  id: string;
  applicant_name: string;
  applicant_email: string;
  created_at: string;
  status: string;
  job_title: string;
  job_id: string;
}

export interface RecentActivityListProps {
  applicants: RecentApplicant[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

export function RecentActivityList({
  applicants,
  loading = false,
  maxItems = 10,
  className = "",
}: RecentActivityListProps) {
  if (loading) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[var(--control-fill-muted)] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-[var(--control-fill-muted)] rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-[var(--control-fill-muted)] rounded w-1/2"></div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-6 bg-[var(--control-fill-muted)] rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)] mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
            <h3 className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
              No recent applicants
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Applicants will appear here once people start applying to your jobs.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
              >
                Post Your First Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayApplicants = applicants.slice(0, maxItems);

  return (
    <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)] mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {displayApplicants.map((applicant, index) => (
              <li key={applicant.id}>
                <div className="relative pb-8">
                  {index !== displayApplicants.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[var(--border-subtle)]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-[var(--cta-solid)] flex items-center justify-center ring-8 ring-[var(--bg-surface)]">
                        <UserIcon className="h-4 w-4 text-[var(--cta-on-cta)]" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <Link
                            href={`/employer/dashboard/applicants/${applicant.job_id}`}
                            className="font-medium text-[var(--text-primary)] hover:text-[var(--cta-solid)]"
                          >
                            {applicant.applicant_name}
                          </Link>
                          <span className="text-[var(--text-secondary)]"> applied to </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {applicant.job_title}
                          </span>
                        </div>
                        <StatusBadge status={applicant.status} size="sm" />
                      </div>
                      <div className="mt-1 flex items-center text-sm text-[var(--text-muted)]">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <time dateTime={applicant.created_at}>
                          {format(new Date(applicant.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </time>
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {applicant.applicant_email}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {applicants.length > maxItems && (
          <div className="mt-6">
            <Link
              href="/employer/dashboard/applicants"
              className="text-sm font-medium text-[var(--cta-solid)] hover:text-[var(--cta-solid-hover)]"
            >
              View all applicants →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
