"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@jobsmv/ui-tripled";
import type { Category, JobSalary, SupportedCurrency } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export default function NewJobPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description_md: "",
    requirements_md: "",
    location: "",
    is_salary_public: true,
    salaries: [] as JobSalary[],
    tags: "",
    category_ids: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function loadCategories() {
      try {
        const cats = await apiClient.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, [isAuthenticated, router]);

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
    setLoading(true);

    try {
      // Transform salaries from camelCase to snake_case for API
      const salariesForApi = formData.salaries.map(salary => ({
        currency: salary.currency,
        amount_min: salary.amountMin,
        amount_max: salary.amountMax,
      }));

      await apiClient.createJob({
        title: formData.title,
        description_md: formData.description_md,
        requirements_md: formData.requirements_md || undefined,
        location: formData.location || undefined,
        is_salary_public: formData.is_salary_public,
        salaries: salariesForApi as any,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
        category_ids: formData.category_ids,
      });
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Post New Job">
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
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

/*
 * CURRENCY SELECTOR IMPLEMENTATION SUMMARY
 * 
 * This form now supports employer selection of currency (MVR or USD) for job salary ranges.
 * 
 * Files modified for end-to-end currency support:
 * 
 * BACKEND:
 * - apps/api/app/db/models.py: Added `currency` column (VARCHAR(3), default='MVR') to Job model
 * - apps/api/alembic/versions/003_add_currency_to_jobs.py: Migration to add currency column
 * - apps/api/app/schemas/job.py: Added `currency: Literal["MVR", "USD"] = "MVR"` to JobBase, JobUpdate
 * - apps/api/app/api/v1/jobs.py: Updated create_job to persist currency field
 * 
 * FRONTEND TYPES:
 * - packages/types/src/index.ts: Added Currency type and currency field to Job interface
 * - apps/web/src/lib/api-client.ts: Updated createJob and updateJob methods to include currency
 * 
 * FRONTEND COMPONENTS:
 * - apps/web/src/app/(dashboard)/dashboard/jobs/new/page.tsx: Added currency selector (MVR/USD)
 * - apps/web/src/app/(dashboard)/dashboard/jobs/[id]/edit/page.tsx: Added currency selector
 * - packages/ui-tripled/src/JobCard.tsx: Currency-aware salary display (ރ for MVR, $ for USD)
 * - apps/web/src/app/(public)/jobs/[id]/page.tsx: Currency-aware salary display on job detail page
 * 
 * BEHAVIOR:
 * - Default currency is MVR for all new jobs
 * - Employers can switch between MVR (ރ) and USD ($) when creating/editing jobs
 * - Job cards and detail pages display the correct currency symbol based on the job's currency field
 * - No automatic conversion; salary numbers are treated as amounts in the selected currency
 * - Existing jobs without currency default to MVR via DB migration
 */

