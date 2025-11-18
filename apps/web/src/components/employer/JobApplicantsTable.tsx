"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  UserIcon,
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  EyeIcon,
  DownloadIcon,
} from "lucide-react";
import type { Application, Job } from "@jobsmv/types";
import { StatusBadge } from "./StatusBadge";

export interface JobApplicantsTableProps {
  job: Job;
  applicants: Application[];
  loading?: boolean;
  onUpdateStatus?: (applicationId: string, status: string) => void;
  onViewDetails?: (application: Application) => void;
  className?: string;
}

export function JobApplicantsTable({
  job,
  applicants,
  loading = false,
  onUpdateStatus,
  onViewDetails,
  className = "",
}: JobApplicantsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filteredApplicants = applicants.filter(applicant =>
    !statusFilter || applicant.status === statusFilter
  );

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "screening", label: "Screening" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
  ];

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    onUpdateStatus?.(applicationId, newStatus);
  };

  if (loading) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        {/* Filters skeleton */}
        <div className="px-4 py-5 sm:p-6 border-b border-[var(--border-subtle)]">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-[var(--control-fill-muted)] rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-[var(--control-fill-muted)] rounded w-40 animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-subtle)]">
            <thead className="bg-[var(--bg-sunken)]">
              <tr>
                {["Applicant", "Applied", "Status", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    <div className="h-4 bg-[var(--control-fill-muted)] rounded animate-pulse w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-[var(--control-fill-muted)] rounded animate-pulse w-24"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 border-b border-[var(--border-subtle)]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
                Applicants for {job.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
                No applicants yet for this job.
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
            No applicants yet
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            When people apply to your job, their applications will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
      {/* Header with filters */}
      <div className="px-4 py-5 sm:p-6 border-b border-[var(--border-subtle)]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
              Applicants for {job.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
              {applicants.length} total applicant{applicants.length !== 1 ? 's' : ''}
              {filteredApplicants.length !== applicants.length &&
                ` (${filteredApplicants.length} shown)`
              }
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-subtle)]">
          <thead className="bg-[var(--bg-sunken)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Applicant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Applied
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Resume
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)]">
            {filteredApplicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-[var(--control-fill-muted)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[var(--cta-solid)] flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-[var(--cta-on-cta)]" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {applicant.applicant_name}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] flex items-center">
                        <MailIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                        {applicant.applicant_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <time dateTime={applicant.created_at}>
                      {format(new Date(applicant.created_at), "MMM d, yyyy")}
                    </time>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {format(new Date(applicant.created_at), "h:mm a")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={applicant.status} />
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                      className="text-xs border border-[var(--border-subtle)] rounded px-2 py-1 focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
                    >
                      <option value="new">New</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {applicant.resume_url ? (
                    <a
                      href={applicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-[var(--cta-solid)] hover:text-[var(--cta-solid-hover)] bg-[var(--cta-solid)] bg-opacity-10 rounded-md"
                    >
                      <DownloadIcon className="w-3 h-3 mr-1" />
                      Download
                    </a>
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">Not provided</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails?.(applicant)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="View application details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplicants.length === 0 && applicants.length > 0 && (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No applicants match the selected status filter.
          </p>
        </div>
      )}
    </div>
  );
}
