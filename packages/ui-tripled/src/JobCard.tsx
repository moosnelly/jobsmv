"use client";

import React from "react";
import { ClockIcon, BookmarkIcon, DollarSignIcon, MapPinIcon, BriefcaseIcon, EyeOffIcon } from "lucide-react";
import type { Job, JobPublic } from "@jobsmv/types";

export interface JobCardProps {
  job: JobPublic;
  onClick?: () => void;
  className?: string;
  accentColor?: "peach" | "mint" | "lilac" | "blue";
}

export interface EmployerJobCardProps {
  job: Job;
  onClick?: () => void;
  className?: string;
  accentColor?: "peach" | "mint" | "lilac" | "blue";
}

export function JobCard({ job, onClick, className = "", accentColor = "peach" }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatSalary = (currency: string, min: number | null) => {
    if (!min) return "";

    const currencySymbol = currency === "USD" ? "$" : currency;
    const prefix = currency === "USD" ? currencySymbol : `${currencySymbol} `;

    return `${prefix}${min.toLocaleString()}`;
  };

  const accentClass = `job-card--${accentColor}`;

  return (
    <div
      onClick={onClick}
      className={`job-card ${accentClass} ${className}`}
    >
      {/* Top Section - Accent Background */}
      <div className="job-card__top">
        {/* Header: Date and Bookmark */}
        <div className="job-card__header">
          <div className="job-card__meta">
            <ClockIcon className="w-3 h-3" />
            <span>{formatDate(job.created_at)}</span>
          </div>
          <button 
            className="icon-button focus-ring" 
            aria-label="Bookmark job"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bookmark logic here
            }}
          >
            <BookmarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Company Name */}
        {job.employer_company_name && (
          <div className="job-card__company">
            {job.employer_company_name}
          </div>
        )}

        {/* Title Row: Job Title and Logo */}
        <div className="job-card__title-row">
          <h3 className="job-card__title">
            {job.title}
          </h3>
          <div className="job-card__logo">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Tags/Chips */}
        <div className="job-card__chips">
          {job.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Section - White Background */}
      <div className="job-card__bottom">
        <div className="job-card__info">
          {(() => {
            if (job.salary_hidden || !job.is_salary_public) {
              return (
                <div className="job-card__salary flex items-center gap-2">
                  <EyeOffIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 italic">Salary: Negotiable</span>
                </div>
              );
            }

            if (job.salaries && job.salaries.length > 0) {
              const primarySalary = job.salaries[0];
              // Handle both camelCase and snake_case from API
              const min = (primarySalary as any).amountMin ?? (primarySalary as any).amount_min;

              const salaryText = formatSalary(primarySalary.currency, min);

              if (salaryText) {
                return (
                  <div className="job-card__salary">
                    <span style={{ fontFamily: "var(--font-numeric)" }} className="text-gray-900">
                      {salaryText}
                    </span>
                  </div>
                );
              }
            }

            return null;
          })()}
          {job.location && (
            <div className="job-card__location">
              <MapPinIcon className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          )}
        </div>
        <button 
          className="job-card__details-button focus-ring"
          aria-label="View job details"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

export function EmployerJobCard({ job, onClick, className = "", accentColor = "peach" }: EmployerJobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatSalary = (currency: string, min: number | null) => {
    if (!min) return "";

    const currencySymbol = currency === "USD" ? "$" : currency;
    const prefix = currency === "USD" ? currencySymbol : `${currencySymbol} `;

    return `${prefix}${min.toLocaleString()}`;
  };

  const accentClass = `job-card--${accentColor}`;

  return (
    <div
      onClick={onClick}
      className={`job-card ${accentClass} ${className}`}
    >
      {/* Top Section - Accent Background */}
      <div className="job-card__top">
        {/* Header: Date and Status */}
        <div className="job-card__header">
          <div className="job-card__meta">
            <ClockIcon className="w-3 h-3" />
            <span>{formatDate(job.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              job.status === 'published'
                ? 'bg-green-100 text-green-800'
                : job.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
            {!job.is_salary_public && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <EyeOffIcon className="w-3 h-3" />
                Salary Hidden
              </span>
            )}
            {job.is_salary_public && job.salaries && job.salaries.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <DollarSignIcon className="w-3 h-3" />
                Salary Disclosed
              </span>
            )}
          </div>
        </div>

        {/* Company Name */}
        {job.employer_company_name && (
          <div className="job-card__company">
            {job.employer_company_name}
          </div>
        )}

        {/* Title Row: Job Title and Logo */}
        <div className="job-card__title-row">
          <h3 className="job-card__title">
            {job.title}
          </h3>
          <div className="job-card__logo">
            <BriefcaseIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Tags/Chips */}
        <div className="job-card__chips">
          {job.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Section - White Background */}
      <div className="job-card__bottom">
        <div className="job-card__info">
          {(() => {
            if (job.salaries && job.salaries.length > 0) {
              const salaryStrings = job.salaries.map(salary => {
                // Handle both camelCase and snake_case from API
                const min = (salary as any).amountMin ?? (salary as any).amount_min;

                return formatSalary(salary.currency, min);
              }).filter(s => s.length > 0);

              if (salaryStrings.length > 0) {
                return (
                  <div className="job-card__salary">
                    <span style={{ fontFamily: "var(--font-numeric)" }} className={job.is_salary_public ? 'text-gray-900' : 'text-gray-600'}>
                      {salaryStrings.join(" • ")}
                    </span>
                    {!job.is_salary_public && (
                      <span className="text-xs text-orange-600 italic">(Hidden from applicants)</span>
                    )}
                  </div>
                );
              }
            } else if (!job.is_salary_public) {
              return (
                <div className="job-card__salary flex items-center gap-2">
                  <EyeOffIcon className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-600 italic">No salary set (Hidden from applicants)</span>
                </div>
              );
            }

            return null;
          })()}
          {job.location && (
            <div className="job-card__location">
              <MapPinIcon className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          )}
        </div>
        <button
          className="job-card__details-button focus-ring"
          aria-label="Edit job"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

