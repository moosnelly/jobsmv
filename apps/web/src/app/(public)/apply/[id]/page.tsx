"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Job } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    resume_url: "",
    cover_letter_md: "",
  });

  useEffect(() => {
    async function loadJob() {
      try {
        const jobData = await apiClient.getPublicJob(params.id as string);
        setJob(jobData);
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.applyToJob(params.id as string, formData);
      router.push(`/apply/${params.id}/success`);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-600 mb-6">{job.location}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="applicant_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="applicant_name"
                required
                value={formData.applicant_name}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="applicant_email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="applicant_email"
                required
                value={formData.applicant_email}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="resume_url"
                className="block text-sm font-medium text-gray-700"
              >
                Resume URL
              </label>
              <input
                type="url"
                id="resume_url"
                value={formData.resume_url}
                onChange={(e) =>
                  setFormData({ ...formData, resume_url: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="cover_letter_md"
                className="block text-sm font-medium text-gray-700"
              >
                Cover Letter
              </label>
              <textarea
                id="cover_letter_md"
                rows={6}
                value={formData.cover_letter_md}
                onChange={(e) =>
                  setFormData({ ...formData, cover_letter_md: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

