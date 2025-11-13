"use client";

import React from "react";

export interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  title,
  description,
  actions,
  className = "",
}: DashboardShellProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description || actions) && (
          <div className="mb-8 mt-8 flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
        <div className="mb-8">{children}</div>
      </div>
    </div>
  );
}

