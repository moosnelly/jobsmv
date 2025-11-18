"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployerDashboardLayout } from "@/components/employer/EmployerDashboardLayout";
import { EmployerJobsTable } from "@/components/employer/EmployerJobsTable";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Job } from "@jobsmv/types";

export default function EmployerDashboardJobsPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getJobs();
      setJobs(response.items);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setError(error instanceof Error ? error.message : "Failed to load jobs");

      if ((error as any).status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    loadJobs();
  }, [isAuthenticated, logout]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await apiClient.deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const handleToggleStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiClient.updateJob(jobId, { status: newStatus });
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus as Job['status'] } : job
      ));
    } catch (error) {
      console.error("Failed to update job status:", error);
      alert("Failed to update job status. Please try again.");
    }
  };

  return (
    <EmployerDashboardLayout
      title="My Jobs"
      description="Manage your job listings"
      actions={
        <a
          href="/dashboard/jobs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
        >
          Post New Job
        </a>
      }
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading jobs
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadJobs}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmployerJobsTable
        jobs={jobs}
        loading={loading}
        onDeleteJob={handleDeleteJob}
        onToggleStatus={handleToggleStatus}
      />
    </EmployerDashboardLayout>
  );
}
