"use client";

import { useEffect, useState, useCallback } from "react";
import { EmployerDashboardLayout } from "@/components/employer/EmployerDashboardLayout";
import { EmployerStatsCards } from "@/components/employer/EmployerStatsCards";
import { RecentActivityList } from "@/components/employer/RecentActivityList";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Job, Application } from "@jobsmv/types";

interface EmployerStats {
  activeJobs: number;
  totalApplicants: number;
  expiringJobs: number;
  recentJob?: {
    title: string;
    updatedAt: string;
  };
}

interface RecentApplicant {
  id: string;
  applicant_name: string;
  applicant_email: string;
  created_at: string;
  status: string;
  job_title: string;
  job_id: string;
}

export default function EmployerDashboardOverviewPage() {
  const { isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplicants: 0,
    expiringJobs: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverviewData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all jobs first
        const jobsResponse = await apiClient.getJobs();
        const jobs = jobsResponse.items;

        // Calculate basic stats from jobs
        const activeJobs = jobs.filter(job => job.status === 'published').length;
        const expiringJobs = jobs.filter(job => {
          const updatedAt = new Date(job.updated_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return job.status === 'published' && updatedAt < thirtyDaysAgo;
        }).length;

        // Find most recently updated job
        const recentJob = jobs
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

        // Set initial stats
        setStats({
          activeJobs,
          totalApplicants: 0, // Will be updated after fetching applicants
          expiringJobs,
          recentJob: recentJob ? {
            title: recentJob.title,
            updatedAt: recentJob.updated_at,
          } : undefined,
        });

        // Fetch applicants for published jobs only (to reduce API calls)
        const publishedJobs = jobs.filter(job => job.status === 'published');

        if (publishedJobs.length === 0) {
          // No published jobs, so no applicants
          setRecentApplicants([]);
          setStats(prev => ({ ...prev, totalApplicants: 0 }));
          return;
        }

        // Fetch applicants for published jobs only (limit to first 5 jobs to avoid too many API calls)
        const jobsToFetch = publishedJobs.slice(0, 5);

        const applicantsPromises = jobsToFetch.map(async (job) => {
          try {
            const applicantsResponse = await apiClient.getJobApplications(job.id);
            return applicantsResponse.items.map(applicant => ({
              ...applicant,
              job_title: job.title,
              job_id: job.id,
            }));
          } catch (error) {
            console.warn(`Failed to load applicants for job ${job.id}:`, error);
            return [];
          }
        });

        const applicantsArrays = await Promise.all(applicantsPromises);
        const allApplicants = applicantsArrays.flat();

        // Sort by application date (most recent first) and take top 10
        const recentApplicantsData = allApplicants
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        // Update stats with total applicants count
        setStats(prev => ({
          ...prev,
          totalApplicants: allApplicants.length
        }));

        setRecentApplicants(recentApplicantsData);

      } catch (error) {
        console.error("Failed to load overview data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data";
        console.error("Error details:", error);

        // Set fallback stats even on error
        setStats({
          activeJobs: 0,
          totalApplicants: 0,
          expiringJobs: 0,
          recentJob: undefined,
        });
        setRecentApplicants([]);

        setError(errorMessage);

        if ((error as any).status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    loadOverviewData();
  }, [isAuthenticated, logout, loadOverviewData]);

  if (error) {
    return (
      <EmployerDashboardLayout title="Overview" description="Dashboard overview and recent activity">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={loadOverviewData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Try again
                </button>
                <a
                  href="/employer/dashboard/jobs"
                  className="bg-white px-3 py-2 rounded-md text-sm font-medium text-red-800 border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                >
                  Go to Jobs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Show welcome message for new users */}
        <div className="mt-6 bg-gradient-to-r from-[var(--accent-card-1)] to-[var(--accent-card-2)] rounded-lg shadow-sm">
          <div className="px-6 py-8 sm:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Welcome to your Employer Dashboard!
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                Get started by posting your first job to attract top talent in the Maldives.
              </p>
              <a
                href="/dashboard/jobs/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)] shadow-sm"
              >
                Post Your First Job
              </a>
            </div>
          </div>
        </div>

        {/* Show basic stats even if there's an error */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 text-[var(--text-secondary)]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      0
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
                  <div className="w-6 h-6 text-[var(--text-secondary)]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Total Applicants
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      0
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
                  <div className="w-6 h-6 text-[var(--text-secondary)]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Jobs Expiring Soon
                    </dt>
                    <dd className="text-lg font-medium text-[var(--text-primary)]">
                      0
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
                  <div className="w-6 h-6 text-[var(--text-secondary)]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      Recent Update
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      No jobs yet
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  return (
    <EmployerDashboardLayout title="Overview" description="Dashboard overview and recent activity">
      <div className="space-y-6">
        {/* Stats Cards */}
        <EmployerStatsCards stats={stats} loading={loading} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityList applicants={recentApplicants} loading={loading} />

          {/* Quick Actions */}
          <div className="bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/jobs/new"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                >
                  Post a New Job
                </a>
                <a
                  href="/employer/dashboard/jobs"
                  className="w-full flex items-center justify-center px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                >
                  Manage Jobs
                </a>
                <a
                  href="/employer/dashboard/applicants"
                  className="w-full flex items-center justify-center px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                >
                  View Applicants
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}
