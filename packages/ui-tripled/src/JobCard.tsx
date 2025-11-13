"use client";

import React from "react";
import type { Job } from "@jobsmv/types";

export interface JobCardProps {
  job: Job;
  onClick?: () => void;
  className?: string;
}

export function JobCard({ job, onClick, className = "" }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6
        shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary-300
        cursor-pointer ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {job.title}
          </h3>
          {job.location && (
            <p className="mt-1 text-sm text-gray-600">{job.location}</p>
          )}
          {job.salary_min && job.salary_max && (
            <p className="mt-1 text-sm font-medium text-primary-600">
              ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
            </p>
          )}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <span
            className={`
              inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
              ${
                job.status === "published"
                  ? "bg-green-100 text-green-800"
                  : job.status === "closed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            `}
          >
            {job.status}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        <span className="group-hover:text-primary-600 transition-colors">
          View details →
        </span>
      </div>
    </div>
  );
}

