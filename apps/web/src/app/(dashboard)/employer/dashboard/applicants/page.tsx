"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmployerDashboardLayout } from "@/components/employer/EmployerDashboardLayout";
import { StatusBadge } from "@/components/employer/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import {
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { Job, Application } from "@jobsmv/types";
import { format } from "date-fns";

interface JobWithApplicants extends Job {
  applicantCount: number;
  recentApplicants: Application[];
}

export default function EmployerDashboardApplicantsPage() {
  const { isAuthenticated, logout } = useAuth();
  const [jobsWithApplicants, setJobsWithApplicants] = useState<JobWithApplicants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    async function loadJobsWithApplicants() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all jobs
        const jobsResponse = await apiClient.getJobs();
        const jobs = jobsResponse.items.filter(job => job.status === 'published'); // Only show published jobs

        // Fetch applicants for each job
        const jobsWithApplicantsPromises = jobs.map(async (job) => {
          try {
            const applicantsResponse = await apiClient.getJobApplications(job.id);
            const applicants = applicantsResponse.items;

            // Get recent applicants (last 3)
            const recentApplicants = applicants
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3);

            return {
              ...job,
              applicantCount: applicants.length,
              recentApplicants,
            };
          } catch (error) {
            console.warn(`Failed to load applicants for job ${job.id}:`, error);
            return {
              ...job,
              applicantCount: 0,
              recentApplicants: [],
            };
          }
        });

        const jobsWithApplicantsData = await Promise.all(jobsWithApplicantsPromises);
        setJobsWithApplicants(jobsWithApplicantsData);
      } catch (error) {
        console.error("Failed to load jobs with applicants:", error);
        setError(error instanceof Error ? error.message : "Failed to load applicants data");

        if ((error as any).status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    loadJobsWithApplicants();
  }, [isAuthenticated, logout]);

  if (loading) {
    return (
      <EmployerDashboardLayout title="Applicants" description="Manage job applications">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md animate-pulse">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-[var(--control-fill-muted)] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-5 bg-[var(--control-fill-muted)] rounded w-48 mb-2"></div>
                      <div className="h-4 bg-[var(--control-fill-muted)] rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-8 bg-[var(--control-fill-muted)] rounded w-16"></div>
                    <div className="h-8 bg-[var(--control-fill-muted)] rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EmployerDashboardLayout>
    );
  }

  if (error) {
    return (
      <EmployerDashboardLayout title="Applicants" description="Manage job applications">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading applicants
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  const publishedJobs = jobsWithApplicants.filter(job => job.status === 'published');
  const totalApplicants = jobsWithApplicants.reduce((sum, job) => sum + job.applicantCount, 0);

  return (
    <EmployerDashboardLayout title="Applicants" description="Manage job applications">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingIcon className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      {publishedJobs.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Total Applicants
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      {totalApplicants}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Jobs with Applicants
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      {jobsWithApplicants.filter(job => job.applicantCount > 0).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-[var(--border-subtle)]">
            <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
              Your Jobs
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
              View and manage applicants for each of your published jobs.
            </p>
          </div>

          {publishedJobs.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <BuildingIcon className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
              <h3 className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                No published jobs
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                You need to publish jobs before you can receive applicants.
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
          ) : (
            <ul role="list" className="divide-y divide-[var(--border-subtle)]">
              {publishedJobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/employer/dashboard/applicants/${job.id}`}
                    className="block hover:bg-[var(--control-fill-muted)] transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-[var(--cta-solid)] flex items-center justify-center">
                              <BuildingIcon className="h-6 w-6 text-[var(--cta-on-cta)]" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {job.title}
                              </h4>
                              <StatusBadge status={job.status} size="sm" />
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              {job.location && (
                                <div className="flex items-center text-sm text-[var(--text-secondary)]">
                                  <MapPinIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                                  {job.location}
                                </div>
                              )}
                              <div className="flex items-center text-sm text-[var(--text-secondary)]">
                                <CalendarIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                                Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                              </div>
                            </div>
                            {job.recentApplicants.length > 0 && (
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-[var(--text-muted)]">
                                  Recent applicants:
                                </span>
                                {job.recentApplicants.slice(0, 3).map((applicant, index) => (
                                  <span
                                    key={applicant.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--chip-bg)] text-[var(--chip-text)]"
                                  >
                                    {applicant.applicant_name}
                                  </span>
                                ))}
                                {job.applicantCount > 3 && (
                                  <span className="text-xs text-[var(--text-muted)]">
                                    +{job.applicantCount - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[var(--text-primary)]">
                              {job.applicantCount}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              {job.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}
