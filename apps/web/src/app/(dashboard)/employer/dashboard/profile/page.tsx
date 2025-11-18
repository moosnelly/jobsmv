"use client";

import { useEffect, useState } from "react";
import { EmployerDashboardLayout } from "@/components/employer/EmployerDashboardLayout";
import { EmployerProfileForm } from "@/components/employer/EmployerProfileForm";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Employer } from "@jobsmv/types";

export default function EmployerProfilePage() {
  const { isAuthenticated, logout } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadEmployer = async () => {
    try {
      setLoading(true);
      setError(null);
      const employerData = await apiClient.getCurrentEmployer();
      setEmployer(employerData);
    } catch (error) {
      console.error("Failed to load employer profile:", error);
      setError(error instanceof Error ? error.message : "Failed to load profile");

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

    loadEmployer();
  }, [isAuthenticated, logout]);

  const handleUpdateProfile = async (data: Partial<Employer>) => {
    if (!employer) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedEmployer = await apiClient.updateEmployer(data);
      setEmployer(updatedEmployer);
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMessage);
      throw error; // Re-throw to let the form handle it
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerDashboardLayout title="Profile Settings" description="Manage your company information">
        <EmployerProfileForm
          employer={{} as Employer}
          loading={true}
          onSubmit={handleUpdateProfile}
        />
      </EmployerDashboardLayout>
    );
  }

  if (error && !employer) {
    return (
      <EmployerDashboardLayout title="Profile Settings" description="Manage your company information">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading profile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadEmployer}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  if (!employer) {
    return (
      <EmployerDashboardLayout title="Profile Settings" description="Manage your company information">
        <div className="text-center py-12">
          <div className="text-lg text-[var(--text-secondary)]">Loading profile...</div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  return (
    <EmployerDashboardLayout title="Profile Settings" description="Manage your company information">
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

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
                Error updating profile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <EmployerProfileForm
        employer={employer}
        loading={loading}
        onSubmit={handleUpdateProfile}
      />
    </EmployerDashboardLayout>
  );
}
