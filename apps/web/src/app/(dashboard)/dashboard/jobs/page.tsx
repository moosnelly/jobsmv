"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JobCard, DashboardShell } from "@jobsmv/ui-tripled";
import type { Job } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export default function DashboardJobsPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function loadJobs() {
      try {
        const jobsData = await apiClient.getJobs();
        setJobs(jobsData.items);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        if ((error as any).status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [isAuthenticated, router, logout]);

  if (loading) {
    return (
      <DashboardShell title="Jobs">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading jobs...</div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="My Jobs"
      description="Manage your job listings"
      actions={
        <>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Post New Job
          </Link>
        </>
      }
    >
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No jobs posted yet.</p>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const accentColors = ["peach", "mint", "lilac", "blue"] as const;
            const accentColor = accentColors[index % accentColors.length] as "peach" | "mint" | "lilac" | "blue";
            return (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}/edit`} className="focus-ring">
                <JobCard job={job} accentColor={accentColor} />
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

