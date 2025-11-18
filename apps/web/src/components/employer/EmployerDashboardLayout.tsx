"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BuildingIcon,
  UsersIcon,
  BriefcaseIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  PlusIcon,
  LogOutIcon,
  ChevronDownIcon,
  BarChart3Icon,
} from "lucide-react";
import type { Employer } from "@jobsmv/types";
import { useAuth } from "@/lib/auth";
import { useEmployer } from "@/hooks/useEmployerData";

export interface EmployerDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern?: RegExp;
}

const navigation: NavItem[] = [
  {
    label: "Overview",
    href: "/employer/dashboard",
    icon: BarChart3Icon,
    activePattern: /^\/employer\/dashboard\/?$/,
  },
  {
    label: "My Jobs",
    href: "/employer/jobs",
    icon: BriefcaseIcon,
    activePattern: /^\/employer\/jobs/,
  },
  {
    label: "Applicants",
    href: "/employer/applicants",
    icon: UsersIcon,
    activePattern: /^\/employer\/applicants/,
  },
  {
    label: "Profile",
    href: "/employer/profile",
    icon: UserIcon,
    activePattern: /^\/employer\/profile/,
  },
];

export function EmployerDashboardLayout({
  children,
  title,
  description,
  actions,
}: EmployerDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { employer, loading } = useEmployer();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (item: NavItem): boolean => {
    return item.activePattern?.test(pathname) ?? pathname === item.href;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)]">
        <div className="flex h-screen">
          {/* Sidebar skeleton */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="w-8 h-8 bg-[var(--control-fill-muted)] rounded-lg animate-pulse"></div>
                <div className="ml-2 h-4 bg-[var(--control-fill-muted)] rounded w-20 animate-pulse"></div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item, index) => (
                  <div key={item.label} className="flex items-center px-2 py-2">
                    <div className="w-5 h-5 bg-[var(--control-fill-muted)] rounded animate-pulse mr-3"></div>
                    <div className="h-4 bg-[var(--control-fill-muted)] rounded flex-1 animate-pulse"></div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:pl-64 flex flex-col flex-1">
            <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-sm">
              <button className="px-4 border-r border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none lg:hidden">
                <MenuIcon className="w-6 h-6" />
              </button>
              <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-5 bg-[var(--control-fill-muted)] rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 bg-[var(--control-fill-muted)] rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-[var(--control-fill-muted)] rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-[var(--control-fill-muted)] rounded w-48"></div>
                    <div className="h-4 bg-[var(--control-fill-muted)] rounded w-64"></div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-[var(--bg-surface)] overflow-hidden shadow rounded-lg">
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
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div className="fixed inset-0 bg-[var(--text-primary)] bg-opacity-25" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--cta-solid)]"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XIcon className="h-6 w-6 text-[var(--text-secondary)]" />
                </button>
              </div>
              <SidebarContent employer={employer} navigation={navigation} isActiveRoute={isActiveRoute} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] overflow-y-auto">
            <SidebarContent employer={employer} navigation={navigation} isActiveRoute={isActiveRoute} />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-sm">
            <button
              type="button"
              className="px-4 border-r border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--cta-solid)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Employer Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Employer info dropdown */}
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cta-solid)] rounded-md">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--cta-solid)] to-[var(--cta-solid-hover)] flex items-center justify-center">
                      <BuildingIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="hidden sm:block truncate max-w-[120px]">
                      {employer?.company_name || "Company"}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick actions */}
                <Link
                  href="/employer/jobs/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--cta-on-cta)] bg-[var(--cta-solid)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Post Job
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-[var(--border-default)] text-sm font-medium rounded-md text-[var(--text-secondary)] bg-[var(--control-fill)] hover:bg-[var(--control-fill-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)]"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {(title || description || actions) && (
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      {title && (
                        <h1
                          className="text-2xl font-bold text-[var(--text-primary)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
                      )}
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                  </div>
                )}

                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  employer: Employer | null;
  navigation: NavItem[];
  isActiveRoute: (item: NavItem) => boolean;
}

function SidebarContent({ employer, navigation, isActiveRoute }: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center flex-shrink-0 px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--cta-solid)] flex items-center justify-center">
            <BriefcaseIcon className="w-5 h-5 text-[var(--cta-on-cta)]" />
          </div>
          <span
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            JobsMv
          </span>
        </Link>
      </div>

      {/* Employer info */}
      <div className="px-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cta-solid)] to-[var(--cta-solid-hover)] flex items-center justify-center">
            <BuildingIcon className="w-5 h-5 text-[var(--cta-on-cta)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-[var(--text-primary)] truncate">
              {employer?.company_name || "Company"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] truncate">
              {employer?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-[var(--cta-solid)] text-[var(--cta-on-cta)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--control-fill-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? "text-[var(--cta-on-cta)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
