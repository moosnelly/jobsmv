"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@jobsmv/ui-tripled";
import type { Category } from "@jobsmv/types";
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
    salary_min: "",
    salary_max: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.createJob({
        title: formData.title,
        description_md: formData.description_md,
        requirements_md: formData.requirements_md || undefined,
        location: formData.location || undefined,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
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

