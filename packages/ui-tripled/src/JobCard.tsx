"use client";

import React from "react";
import { ClockIcon, BookmarkIcon, MapPinIcon, BriefcaseIcon } from "lucide-react";
import type { Job } from "@jobsmv/types";

export interface JobCardProps {
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

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;

    const symbol = job.currency === "USD" ? "$" : "ރ";
    const min = job.salary_min;
    const max = job.salary_max;

    if (min && max) {
      return `${symbol}${min.toLocaleString()} – ${symbol}${max.toLocaleString()}`;
    }
    if (min) {
      return `${symbol}${min.toLocaleString()}`;
    }
    if (max) {
      return `${symbol}${max.toLocaleString()}`;
    }
    return null;
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
          {formatSalary(job) && (
            <div className="job-card__salary">
              <span style={{ fontFamily: "var(--font-numeric)" }}>
                {formatSalary(job)}
              </span>
            </div>
          )}
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

