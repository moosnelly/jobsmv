"use client";

import React, { FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloudIcon } from "lucide-react";
import type { Employer } from "@jobsmv/types";

export interface GlassProfileSettingsCardProps {
  employer?: Employer | null;
  onSubmit: (data: Partial<Employer>) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function GlassProfileSettingsCard({
  employer,
  onSubmit,
  loading = false,
  className = "",
}: GlassProfileSettingsCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [companyName, setCompanyName] = useState(employer?.company_name || "");
  const [email, setEmail] = useState(employer?.email || "");
  const [contactInfo, setContactInfo] = useState<Record<string, any>>(
    employer?.contact_info || {}
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      company_name: companyName,
      email,
      contact_info: contactInfo,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
      }}
      className={`w-full max-w-3xl rounded-card overflow-hidden border border-subtle/60 bg-card/85 p-8 backdrop-blur-xl sm:p-12 relative ${className}`}
      aria-labelledby="glass-profile-settings-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/5 via-primary/2.5 to-transparent"
      ></div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-subtle/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted">
            Profile
          </div>
          <h1
            id="glass-profile-settings-title"
            className="mt-3 text-2xl font-bold text-primary sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Profile settings
          </h1>
          <p className="mt-2 text-sm text-muted">
            Update your company information and contact details.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-pill border border-subtle/60 bg-white/5 px-4 py-2 text-muted transition-colors duration-300 hover:border-primary/60 hover:bg-primary/15 hover:text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          Auto-save enabled
        </span>
      </div>

      <form className="grid gap-8 sm:grid-cols-5" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-subtle/60 bg-background/40 p-6 backdrop-blur">
            <div className="h-24 w-24 rounded-full border border-subtle/60 bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {getInitials(companyName)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary">{companyName || "Company Name"}</p>
              <p className="text-xs text-muted">Employer</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-pill border border-subtle bg-white/5 px-4 py-2 text-sm text-primary hover:bg-sunken transition-colors"
            >
              <UploadCloudIcon className="mr-2 h-4 w-4" />
              Update logo
            </button>
          </div>
        </div>

        <div className="space-y-6 sm:col-span-3">
          <div className="space-y-2">
            <label
              htmlFor="profile-company-name"
              className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
            >
              Company name
            </label>
            <input
              id="profile-company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-11 rounded-[16px] border border-subtle bg-background/60 px-4 text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
              placeholder="Enter your company name"
              autoComplete="organization"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="profile-email"
              className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-[16px] border border-subtle bg-background/60 px-4 text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="profile-phone"
                className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
              >
                Phone number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={contactInfo?.phone || ""}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, phone: e.target.value })
                }
                className="w-full h-11 rounded-[16px] border border-subtle bg-background/60 px-4 text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="profile-website"
                className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
              >
                Website
              </label>
              <input
                id="profile-website"
                type="url"
                value={contactInfo?.website || ""}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, website: e.target.value })
                }
                className="w-full h-11 rounded-[16px] border border-subtle bg-background/60 px-4 text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                placeholder="https://example.com"
                autoComplete="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="profile-bio"
              className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
            >
              Company description
            </label>
            <textarea
              id="profile-bio"
              value={contactInfo?.bio || ""}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, bio: e.target.value })
              }
              rows={4}
              className="w-full rounded-[16px] border border-subtle bg-background/60 px-4 py-3 text-sm text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all resize-none"
              placeholder="Tell us about your company, mission, or current focus."
            />
            <p className="text-right text-xs text-muted">
              {(contactInfo?.bio || "").length}/500 characters
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-pill border border-subtle bg-white/5 px-6 py-3 text-sm text-muted hover:text-primary hover:bg-sunken transition-colors"
              onClick={() => {
                setCompanyName(employer?.company_name || "");
                setEmail(employer?.email || "");
                setContactInfo(employer?.contact_info || {});
              }}
            >
              Reset changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-pill bg-[#0E1116] text-white px-6 py-3 font-semibold hover:bg-[#0B1220] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_60px_-30px_rgba(79,70,229,0.75)] hover:-translate-y-1"
            >
              {loading ? "Saving..." : "Save settings"}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
