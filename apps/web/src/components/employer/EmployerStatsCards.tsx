"use client";

import React from "react";
import { StatCard } from "@jobsmv/ui-tripled";
import { BriefcaseIcon, UsersIcon, ClockIcon, TrendingUpIcon } from "lucide-react";

export interface EmployerStats {
  activeJobs: number;
  totalApplicants: number;
  expiringJobs: number;
  recentJob?: {
    title: string;
    updatedAt: string;
  };
}

export interface EmployerStatsCardsProps {
  stats: EmployerStats;
  loading?: boolean;
  className?: string;
}

export function EmployerStatsCards({
  stats,
  loading = false,
  className = "",
}: EmployerStatsCardsProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-[var(--control-fill-muted)] rounded animate-pulse"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-[var(--control-fill-muted)] rounded w-20 animate-pulse mb-2"></div>
                  <div className="h-5 bg-[var(--control-fill-muted)] rounded w-12 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      description: "Currently published",
      icon: <BriefcaseIcon className="w-6 h-6" />,
      trend: stats.activeJobs > 0 ? { value: 0, isPositive: true } : undefined,
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
      description: "Across all jobs",
      icon: <UsersIcon className="w-6 h-6" />,
      trend: stats.totalApplicants > 0 ? { value: 0, isPositive: true } : undefined,
    },
    {
      title: "Jobs Expiring Soon",
      value: stats.expiringJobs,
      description: "Need attention",
      icon: <ClockIcon className="w-6 h-6" />,
      trend: stats.expiringJobs > 0 ? { value: stats.expiringJobs, isPositive: false } : undefined,
    },
    {
      title: "Recent Update",
      value: stats.recentJob ? "Updated" : "No jobs yet",
      description: stats.recentJob
        ? `${stats.recentJob.title.length > 15 ? stats.recentJob.title.substring(0, 15) + "..." : stats.recentJob.title}`
        : "Post your first job to get started",
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          trend={card.trend}
        />
      ))}
    </div>
  );
}
