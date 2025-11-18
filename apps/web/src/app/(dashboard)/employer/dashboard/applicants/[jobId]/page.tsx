"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmployerDashboardLayout } from "@/components/employer/EmployerDashboardLayout";
import { JobApplicantsTable } from "@/components/employer/JobApplicantsTable";
import { ApplicationDetailsModal } from "@/components/employer/ApplicationDetailsModal";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { ArrowLeftIcon } from "lucide-react";
import type { Job, Application } from "@jobsmv/types";

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load job details and applicants in parallel
      const [jobData, applicantsData] = await Promise.all([
        apiClient.getJob(params.jobId),
        apiClient.getJobApplications(params.jobId),
      ]);

      setJob(jobData);
      setApplicants(applicantsData.items);
    } catch (error) {
      console.error("Failed to load job applicants:", error);
      setError(error instanceof Error ? error.message : "Failed to load applicants");

      if ((error as any).status === 401) {
        logout();
      } else if ((error as any).status === 404) {
        setError("Job not found or you don't have permission to view it.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    if (params.jobId) {
      loadData();
    }
  }, [isAuthenticated, params.jobId, logout]);

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      await apiClient.updateApplication(applicationId, { status });

      // Update local state
      setApplicants(applicants.map(app =>
        app.id === applicationId ? { ...app, status: status as Application['status'] } : app
      ));
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert("Failed to update application status. Please try again.");
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <EmployerDashboardLayout title="Applicants" description="Manage job applications">
        <JobApplicantsTable
          job={{} as Job}
          applicants={[]}
          loading={true}
        />
      </EmployerDashboardLayout>
    );
  }

  if (error || !job) {
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
                {error || "Job not found"}
              </div>
              <div className="mt-4">
                <Link
                  href="/employer/dashboard/applicants"
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  ← Back to all applicants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  return (
    <>
      <EmployerDashboardLayout
        title={`Applicants for ${job.title}`}
        description={`${applicants.length} applicant${applicants.length !== 1 ? 's' : ''} • ${job.location || 'Remote'}`}
        actions={
          <Link
            href="/employer/dashboard/applicants"
            className="inline-flex items-center px-3 py-2 border border-[var(--border-default)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        }
      >
        <JobApplicantsTable
          job={job}
          applicants={applicants}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
          onViewDetails={handleViewDetails}
        />
      </EmployerDashboardLayout>

      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
