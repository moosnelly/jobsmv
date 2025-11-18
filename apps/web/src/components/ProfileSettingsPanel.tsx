"use client";

import React, { useState, useEffect } from "react";
import { SlideInPanel, GlassProfileSettingsCard } from "@jobsmv/ui-tripled";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Employer } from "@jobsmv/types";

export interface ProfileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsPanel({
  isOpen,
  onClose,
}: ProfileSettingsPanelProps) {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const isAuthed = isAuthenticated();

  // Load employer data when panel opens
  useEffect(() => {
    if (!isOpen || !isAuthed) {
      return;
    }

    setLoading(true);
    setError(null);

    apiClient
      .getCurrentEmployer()
      .then(setEmployer)
      .catch((err) => {
        console.error("Failed to load employer:", err);
        setError("Failed to load profile data");
      })
      .finally(() => setLoading(false));
  }, [isOpen, isAuthed]);

  // Handle form submission
  const handleSubmit = async (data: Partial<Employer>) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedEmployer = await apiClient.updateEmployer(data);
      setEmployer(updatedEmployer);
      setSuccess(true);

      // Auto-close after successful save
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update employer:", err);
      setError(err.detail || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Handle panel close
  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <SlideInPanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Profile Settings"
      panelTestId="profile-settings-panel"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary">Loading profile...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA]">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="p-4 rounded-[16px] bg-[#D4F6ED] border border-[#A7F3D0]">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#16A34A]">Profile updated successfully!</p>
            </div>
          </div>
        </div>
      ) : (
        <GlassProfileSettingsCard
          employer={employer}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </SlideInPanel>
  );
}
