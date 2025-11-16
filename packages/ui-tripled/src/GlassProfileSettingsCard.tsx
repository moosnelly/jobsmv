"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Employer } from "@jobsmv/types";

export interface GlassProfileSettingsCardProps {
  employer: Employer | null;
  onSubmit: (data: Partial<Employer>) => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

interface FormState {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  about: string;
}

const defaultFormState: FormState = {
  companyName: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  about: "",
};

function extractContactValue(contactInfo: Employer["contact_info"], key: string) {
  if (contactInfo && typeof contactInfo === "object") {
    const value = contactInfo[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function buildFormState(employer?: Employer | null): FormState {
  if (!employer) {
    return { ...defaultFormState };
  }

  const contactInfo = employer.contact_info ?? {};
  return {
    companyName: employer.company_name ?? "",
    email: employer.email ?? "",
    phone: extractContactValue(contactInfo, "phone"),
    website: extractContactValue(contactInfo, "website"),
    location: extractContactValue(contactInfo, "location"),
    about: extractContactValue(contactInfo, "about"),
  };
}

function isFormStateEqual(a: FormState, b: FormState) {
  return (
    a.companyName === b.companyName &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.website === b.website &&
    a.location === b.location &&
    a.about === b.about
  );
}

export function GlassProfileSettingsCard({
  employer,
  onSubmit,
  loading = false,
  className = "",
}: GlassProfileSettingsCardProps) {
  const [formState, setFormState] = useState<FormState>({ ...defaultFormState });
  const [initialValues, setInitialValues] = useState<FormState>({ ...defaultFormState });
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    const nextState = buildFormState(employer ?? undefined);
    setFormState(nextState);
    setInitialValues(nextState);
    setHasChanged(false);
  }, [employer]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!formState.companyName.trim()) return false;
    if (!formState.email.trim()) return false;
    if (!hasChanged) return false;
    return true;
  }, [formState.companyName, formState.email, hasChanged, loading]);

  const handleInputChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormState((previous) => {
      const next = {
        ...previous,
        [field]: value,
      } as FormState;
      setHasChanged(!isFormStateEqual(next, initialValues));
      return next;
    });
  };

  const handleReset = () => {
    setFormState(initialValues);
    setHasChanged(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const trimmedState: FormState = {
      companyName: formState.companyName.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      website: formState.website.trim(),
      location: formState.location.trim(),
      about: formState.about.trim(),
    };

    const contactInfoPayload: Record<string, string> = {};
    if (trimmedState.phone) contactInfoPayload.phone = trimmedState.phone;
    if (trimmedState.website) contactInfoPayload.website = trimmedState.website;
    if (trimmedState.location) contactInfoPayload.location = trimmedState.location;
    if (trimmedState.about) contactInfoPayload.about = trimmedState.about;

    const payload: Partial<Employer> = {
      company_name: trimmedState.companyName,
      email: trimmedState.email,
      ...(Object.keys(contactInfoPayload).length > 0 && {
        contact_info: contactInfoPayload,
      }),
    };

    await onSubmit(payload);

    setFormState(trimmedState);
    setInitialValues(trimmedState);
    setHasChanged(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative rounded-[28px] border border-white/12 bg-white/85 backdrop-blur-xl shadow-card transition-shadow dark:border-white/10 dark:bg-surface/90 ${className}`}
    >
      <div
        className="absolute inset-x-6 top-0 h-28 rounded-[24px] bg-gradient-to-br from-[var(--color-cta)]/20 via-transparent to-[var(--color-accent-card-3)]/40 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative px-6 pt-8 pb-6">
        <div className="mb-8 rounded-[20px] border border-white/30 bg-white/30 p-6 text-primary backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-2">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-card-2)] text-base font-semibold text-[var(--color-ink)]"
              aria-hidden="true"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {(formState.companyName.trim()[0]?.toUpperCase() ?? "J")}
            </span>
            <div>
              <h3
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formState.companyName.trim() || "Your company"}
              </h3>
              <p className="text-sm text-secondary">
                Keep your employer profile up to date so candidates can reach you easily.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-[20px] border border-white/35 bg-white/65 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <div className="mb-5">
              <h4
                className="text-lg font-semibold text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Company details
              </h4>
              <p className="text-sm text-muted">
                This information appears on your job posts and employer brand pages.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Company name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formState.companyName}
                  onChange={handleInputChange("companyName")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="JobsMV Inc."
                />
              </div>

              <div>
                <label
                  htmlFor="companyEmail"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Contact email
                </label>
                <input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange("email")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="team@company.com"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-white/35 bg-white/65 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <div className="mb-5">
              <h4
                className="text-lg font-semibold text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contact information
              </h4>
              <p className="text-sm text-muted">
                Share how candidates can reach out or learn more about your company.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="companyPhone"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Phone number
                </label>
                <input
                  id="companyPhone"
                  name="companyPhone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleInputChange("phone")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label
                  htmlFor="companyWebsite"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Website
                </label>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  value={formState.website}
                  onChange={handleInputChange("website")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="https://company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="companyLocation"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  Location
                </label>
                <input
                  id="companyLocation"
                  name="companyLocation"
                  type="text"
                  value={formState.location}
                  onChange={handleInputChange("location")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="New York, USA"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="companyAbout"
                  className="block text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  About your company
                </label>
                <textarea
                  id="companyAbout"
                  name="companyAbout"
                  rows={4}
                  value={formState.about}
                  onChange={handleInputChange("about")}
                  className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/85 px-4 py-3 text-sm text-primary shadow-inner placeholder:text-muted/70 focus:border-[var(--color-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)]/40 dark:border-white/10 dark:bg-white/10"
                  placeholder="Tell candidates what makes your team unique, your mission or hiring priorities."
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-4 border-t border-white/30 bg-white/85 px-6 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
        <div className="hidden text-sm text-secondary sm:block">
          All updates save directly to your employer profile.
        </div>
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 items-center justify-center rounded-pill border border-subtle px-5 text-sm font-semibold text-primary transition-colors hover:bg-sunken focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !hasChanged}
          >
            Reset
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-pill bg-[var(--color-cta)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--cta-solid-hover)] focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
