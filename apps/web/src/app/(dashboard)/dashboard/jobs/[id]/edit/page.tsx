"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@jobsmv/ui-tripled";
import type { Job, Category, JobSalary, SupportedCurrency } from "@jobsmv/types";
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
    is_salary_public: true,
    salaries: [] as JobSalary[],
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
        // Transform salaries from API (snake_case) to frontend format (camelCase)
        const transformedSalaries = (jobData.salaries || []).map((salary: any) => ({
          currency: salary.currency,
          amountMin: salary.amount_min ?? salary.amountMin,
          amountMax: salary.amount_max ?? salary.amountMax,
        }));

        setFormData({
          title: jobData.title,
          description_md: jobData.description_md,
          requirements_md: jobData.requirements_md || "",
          location: jobData.location || "",
          is_salary_public: jobData.is_salary_public,
          salaries: transformedSalaries,
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

  const addSalary = () => {
    setFormData({
      ...formData,
      salaries: [...formData.salaries, { currency: "MVR", amountMin: null, amountMax: null }],
    });
  };

  const removeSalary = (index: number) => {
    setFormData({
      ...formData,
      salaries: formData.salaries.filter((_, i) => i !== index),
    });
  };

  const updateSalary = (index: number, field: keyof JobSalary, value: any) => {
    const updatedSalaries = [...formData.salaries];
    updatedSalaries[index] = { ...updatedSalaries[index], [field]: value };
    setFormData({
      ...formData,
      salaries: updatedSalaries,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Transform salaries from camelCase to snake_case for API
      const salariesForApi = formData.salaries.map(salary => ({
        currency: salary.currency,
        amount_min: salary.amountMin,
        amount_max: salary.amountMax,
      }));

      await apiClient.updateJob(params.id as string, {
        title: formData.title,
        description_md: formData.description_md,
        requirements_md: formData.requirements_md || undefined,
        location: formData.location || undefined,
        is_salary_public: formData.is_salary_public,
        salaries: salariesForApi as any,
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
            <label htmlFor="description_md" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description_md"
              rows={6}
              required
              value={formData.description_md}
              onChange={(e) => setFormData({ ...formData, description_md: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="requirements_md" className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <textarea
              id="requirements_md"
              rows={4}
              value={formData.requirements_md}
              onChange={(e) => setFormData({ ...formData, requirements_md: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <select
                id="categories"
                multiple
                value={formData.category_ids}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="is_salary_public"
                checked={formData.is_salary_public}
                onChange={(e) => setFormData({ ...formData, is_salary_public: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_salary_public" className="ml-2 block text-sm text-gray-700">
                Show salary on public listing
              </label>
            </div>

            {formData.is_salary_public && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Salary Information
                  </label>
                  <button
                    type="button"
                    onClick={addSalary}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add Currency
                  </button>
                </div>

                {formData.salaries.length === 0 && (
                  <p className="text-sm text-red-600">At least one salary entry is required when salary is public.</p>
                )}

                {formData.salaries.map((salary, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={salary.currency}
                        onChange={(e) => updateSalary(index, "currency", e.target.value as SupportedCurrency)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        required
                      >
                        <option value="MVR">MVR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Amount
                      </label>
                      <input
                        type="number"
                        value={salary.amountMin || ""}
                        onChange={(e) => updateSalary(index, "amountMin", e.target.value ? parseFloat(e.target.value) : null)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Optional"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Amount
                      </label>
                      <input
                        type="number"
                        value={salary.amountMax || ""}
                        onChange={(e) => updateSalary(index, "amountMax", e.target.value ? parseFloat(e.target.value) : null)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Optional"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSalary(index)}
                      className="mt-6 px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="python, remote, full-time"
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

