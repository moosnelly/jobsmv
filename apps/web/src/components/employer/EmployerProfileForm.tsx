"use client";

import React, { useState } from "react";
import { BuildingIcon, MailIcon, PhoneIcon, GlobeIcon, SaveIcon } from "lucide-react";
import type { Employer } from "@jobsmv/types";

export interface EmployerProfileFormProps {
  employer: Employer;
  loading?: boolean;
  onSubmit: (data: Partial<Employer>) => Promise<void>;
  className?: string;
}

export function EmployerProfileForm({
  employer,
  loading = false,
  onSubmit,
  className = "",
}: EmployerProfileFormProps) {
  const [formData, setFormData] = useState({
    company_name: employer.company_name,
    email: employer.email,
    contact_info: employer.contact_info || {},
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactInfo = formData.contact_info as Record<string, unknown>;

  const handleInputChange = (field: string, value: string) => {
    if (field === 'company_name' || field === 'email') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      // Handle contact_info fields
      setFormData(prev => ({
        ...prev,
        contact_info: { ...contactInfo, [field]: value }
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.company_name !== employer.company_name ||
      formData.email !== employer.email ||
      JSON.stringify(formData.contact_info) !== JSON.stringify(employer.contact_info)
    );
  };

  if (loading) {
    return (
      <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div>
              <div className="h-4 bg-[var(--control-fill-muted)] rounded w-32 mb-2"></div>
              <div className="h-10 bg-[var(--control-fill-muted)] rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-[var(--control-fill-muted)] rounded w-24 mb-2"></div>
              <div className="h-10 bg-[var(--control-fill-muted)] rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-[var(--control-fill-muted)] rounded w-20 mb-2"></div>
              <div className="h-10 bg-[var(--control-fill-muted)] rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-[var(--control-fill-muted)] rounded w-16 mb-2"></div>
              <div className="h-10 bg-[var(--control-fill-muted)] rounded"></div>
            </div>
            <div className="h-10 bg-[var(--control-fill-muted)] rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--bg-surface)] shadow overflow-hidden sm:rounded-md ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[var(--cta-solid)] flex items-center justify-center">
              <BuildingIcon className="h-6 w-6 text-[var(--cta-on-cta)]" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Company Profile
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Update your company information and contact details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-[var(--text-primary)]">
              Company Name *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingIcon className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <input
                type="text"
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)] ${
                  errors.company_name ? 'border-red-300' : 'border-[var(--border-subtle)]'
                }`}
                placeholder="Enter your company name"
              />
            </div>
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
              Contact Email *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)] ${
                  errors.email ? 'border-red-300' : 'border-[var(--border-subtle)]'
                }`}
                placeholder="company@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)]">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <input
                type="tel"
                id="phone"
                value={(contactInfo.phone as string) || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-[var(--text-primary)]">
              Website
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GlobeIcon className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <input
                type="url"
                id="website"
                value={(contactInfo.website as string) || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[var(--border-subtle)] rounded-md shadow-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-[var(--cta-solid)] focus:border-[var(--cta-solid)]"
                placeholder="https://www.company.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !hasChanges()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
