"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@jobsmv/ui-tripled";
import type { Job, Category } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description_md: "",
    requirements_md: "",
    location: "",
    salary_min: "",
    salary_max: "",
    currency: "MVR" as "MVR" | "USD",
    status: "draft",
    tags: "",
    category_ids: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [jobData, categoriesData] = await Promise.all([
          apiClient.getJob(params.id as string),
          apiClient.getCategories(),
        ]);
        setJob(jobData);
        setCategories(categoriesData);
        setFormData({
          title: jobData.title,
          description_md: jobData.description_md,
          requirements_md: jobData.requirements_md || "",
          location: jobData.location || "",
          salary_min: jobData.salary_min?.toString() || "",
          salary_max: jobData.salary_max?.toString() || "",
          currency: jobData.currency || "MVR",
          status: jobData.status,
          tags: jobData.tags?.join(", ") || "",
          category_ids: [],
        });
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadData();
    }
  }, [params.id, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiClient.updateJob(params.id as string, {
        title: formData.title,
        description_md: formData.description_md,
        requirements_md: formData.requirements_md || undefined,
        location: formData.location || undefined,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        currency: formData.currency,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
        category_ids: formData.category_ids,
      });
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await apiClient.deleteJob(params.id as string);
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Edit Job">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading job...</div>
        </div>
      </DashboardShell>
    );
  }

  if (!job) {
    return (
      <DashboardShell title="Edit Job">
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Edit Job">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Similar form fields as new job page */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as "MVR" | "USD" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="MVR">MVR (ރ)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700">
                Min Salary
              </label>
              <input
                type="number"
                id="salary_min"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700">
                Max Salary
              </label>
              <input
                type="number"
                id="salary_max"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

