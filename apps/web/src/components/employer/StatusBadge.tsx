"use client";

import React from "react";

export interface StatusBadgeProps {
  status: string;
  variant?: "neutral" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

const statusConfig = {
  // Job statuses
  draft: { label: "Draft", variant: "warning" as const },
  published: { label: "Published", variant: "success" as const },
  closed: { label: "Closed", variant: "neutral" as const },
  active: { label: "Active", variant: "success" as const },
  inactive: { label: "Inactive", variant: "neutral" as const },

  // Application statuses
  new: { label: "New", variant: "info" as const },
  screening: { label: "Screening", variant: "warning" as const },
  interview: { label: "Interview", variant: "info" as const },
  offer: { label: "Offer", variant: "success" as const },
  hired: { label: "Hired", variant: "success" as const },
  rejected: { label: "Rejected", variant: "error" as const },
  shortlisted: { label: "Shortlisted", variant: "warning" as const },
};

export function StatusBadge({
  status,
  variant,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    variant: variant || "neutral",
  };

  const variantClasses = {
    neutral: "bg-[var(--chip-bg)] text-[var(--chip-text)]",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[config.variant]} ${className}`}
    >
      {config.label}
    </span>
  );
}
