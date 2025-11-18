"use client";

import { useEffect, useState, useMemo } from "react";
import { EmployerStatsCards } from "@/components/employer/EmployerStatsCards";
import { RecentActivityList } from "@/components/employer/RecentActivityList";
import { useEmployerJobs } from "@/hooks/useEmployerData";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/Header";
import type { Application } from "@jobsmv/types";

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

export default function EmployerDashboardPage() {
  const { jobs, loading: jobsLoading, error: jobsError, refetch: refetchJobs } = useEmployerJobs();
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);

  const stats = useMemo<EmployerStats>(() => {
    if (!jobs || jobs.length === 0) {
      return {
        activeJobs: 0,
        totalApplicants: totalApplicantsCount,
        expiringJobs: 0,
      };
    }

    const activeJobs = jobs.filter(job => job.status === 'published').length;
    const expiringJobs = jobs.filter(job => {
      const updatedAt = new Date(job.updated_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return job.status === 'published' && updatedAt < thirtyDaysAgo;
    }).length;

    const recentJob = [...jobs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    return {
      activeJobs,
      totalApplicants: totalApplicantsCount,
      expiringJobs,
      recentJob: recentJob ? {
        title: recentJob.title,
        updatedAt: recentJob.updated_at,
      } : undefined,
    };
  }, [jobs, totalApplicantsCount]);

  useEffect(() => {
    async function loadApplicants() {
      if (!jobs || jobs.length === 0) {
        setApplicantsLoading(false);
        setRecentApplicants([]);
        setTotalApplicantsCount(0);
        return;
      }

      try {
        setApplicantsLoading(true);

        const publishedJobs = jobs.filter(job => job.status === 'published');

        if (publishedJobs.length === 0) {
          setRecentApplicants([]);
          setTotalApplicantsCount(0);
          return;
        }

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

        const recentApplicantsData = allApplicants
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        setTotalApplicantsCount(allApplicants.length);
        setRecentApplicants(recentApplicantsData);
      } catch (error) {
        console.error("Failed to load applicants:", error);
        setRecentApplicants([]);
        setTotalApplicantsCount(0);
      } finally {
        setApplicantsLoading(false);
      }
    }

    loadApplicants();
  }, [jobs]);

  const loading = jobsLoading || applicantsLoading;
  const error = jobsError;

  if (error) {
    return (
      <div className="min-h-screen bg-app">
        <Header showFilters={false} />

        {/* Main Content */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
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
                    onClick={refetchJobs}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Try again
                  </button>
                  <a
                    href="/employer/jobs"
                    className="bg-white px-3 py-2 rounded-md text-sm font-medium text-red-800 border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                  >
                    Go to Jobs
                  </a>
                </div>
              </div>
            </div>
          </div>

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
                  href="/employer/jobs/new"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)] shadow-sm"
                >
                  Post Your First Job
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <Header showFilters={false} />

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <EmployerStatsCards stats={stats} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivityList applicants={recentApplicants} loading={loading} />

            <div className="bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)] mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <a
                    href="/employer/jobs/new"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                  >
                    Post a New Job
                  </a>
                  <a
                    href="/employer/jobs"
                    className="w-full flex items-center justify-center px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                  >
                    Manage Jobs
                  </a>
                  <a
                    href="/employer/applicants"
                    className="w-full flex items-center justify-center px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                  >
                    View Applicants
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
