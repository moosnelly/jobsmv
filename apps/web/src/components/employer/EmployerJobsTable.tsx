"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  MapPinIcon,
  DollarSignIcon,
  CalendarIcon,
  BuildingIcon,
} from "lucide-react";
import type { Job } from "@jobsmv/types";
import { StatusBadge } from "./StatusBadge";

export interface EmployerJobsTableProps {
  jobs: Job[];
  loading?: boolean;
  onDeleteJob?: (jobId: string) => void;
  onToggleStatus?: (jobId: string, currentStatus: string) => void;
  className?: string;
}

interface JobFilters {
  status: string;
  location: string;
  search: string;
}

export function EmployerJobsTable({
  jobs,
  loading = false,
  onDeleteJob,
  onToggleStatus,
  className = "",
}: EmployerJobsTableProps) {
  const [filters, setFilters] = useState<JobFilters>({
    status: "",
    location: "",
    search: "",
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Job | null;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesLocation = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesSearch =
        !filters.search ||
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.location?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesLocation && matchesSearch;
    });

    // Sort jobs
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [jobs, filters, sortConfig]);

  const handleSort = (key: keyof Job) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: keyof Job) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const formatSalary = (job: Job) => {
    if (!job.is_salary_public || !job.salaries || job.salaries.length === 0) {
      return "Not disclosed";
    }

    const salaryStrings = job.salaries.map((salary) => {
      const currencySymbol = salary.currency === "USD" ? "$" : `${salary.currency} `;
      // Handle both camelCase (from types) and snake_case (from API)
      const min = (salary as any).amountMin ?? (salary as any).amount_min;
      const max = (salary as any).amountMax ?? (salary as any).amount_max;

      if (min && max) {
        return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
      } else if (min) {
        return `${currencySymbol}${min.toLocaleString()}+`;
      }
      return "";
    }).filter(s => s.length > 0);

    return salaryStrings.join(" • ") || "Not specified";
  };

  const handleDelete = (job: Job) => {
    if (confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      onDeleteJob?.(job.id);
    }
  };

  const handleToggleStatus = (job: Job) => {
    const newStatus = job.status === "published" ? "closed" : "published";
    onToggleStatus?.(job.id, newStatus);
  };

  if (loading) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        {/* Filters skeleton */}
        <div className="px-4 py-5 sm:p-6 border-b border-[var(--border-subtle)]">
          <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
            <div className="flex-1 h-10 bg-[var(--control-fill-muted)] rounded-md"></div>
            <div className="w-48 h-10 bg-[var(--control-fill-muted)] rounded-md"></div>
            <div className="w-48 h-10 bg-[var(--control-fill-muted)] rounded-md"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-subtle)]">
            <thead className="bg-[var(--bg-sunken)]">
              <tr>
                {["Job Title", "Location", "Salary", "Status", "Created", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    <div className="h-4 bg-[var(--control-fill-muted)] rounded animate-pulse w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
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

  if (jobs.length === 0) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <BuildingIcon className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
            No jobs found
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Get started by posting your first job.
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
    );
  }

  return (
    <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
      {/* Filters */}
      <div className="px-4 py-5 sm:p-6 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-48 px-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-subtle)]">
          <thead className="bg-[var(--bg-sunken)]">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort("title")}
              >
                Job Title {getSortIcon("title")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort("location")}
              >
                Location {getSortIcon("location")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Salary
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort("created_at")}
              >
                Created {getSortIcon("created_at")}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)]">
            {filteredAndSortedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-[var(--control-fill-muted)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[var(--cta-solid)] flex items-center justify-center">
                        <BuildingIcon className="h-5 w-5 text-[var(--cta-on-cta)]" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        <Link
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="hover:text-[var(--cta-solid)]"
                        >
                          {job.title}
                        </Link>
                      </div>
                      {job.tags && job.tags.length > 0 && (
                        <div className="text-sm text-[var(--text-secondary)]">
                          {job.tags.slice(0, 2).join(", ")}
                          {job.tags.length > 2 && ` +${job.tags.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {job.location || "Remote"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <DollarSignIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span className="truncate max-w-[200px]" title={formatSalary(job)}>
                      {formatSalary(job)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center">
                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {format(new Date(job.created_at), "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/dashboard/jobs/${job.id}/edit`}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      title="Edit job"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`${
                        job.status === "published"
                          ? "text-orange-600 hover:text-orange-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                      title={job.status === "published" ? "Close job" : "Publish job"}
                    >
                      {job.status === "published" ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete job"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedJobs.length === 0 && jobs.length > 0 && (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No jobs match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
