"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserIcon,
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
  BuildingIcon,
} from "lucide-react";
import type { Employer } from "@jobsmv/types";
import { useAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

interface UserDropdownProps {
  className?: string;
}

export default function UserDropdown({ className }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && isAuthenticated()) {
      setLoading(true);
      apiClient
        .getCurrentEmployer()
        .then(setEmployer)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [hasMounted, isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setEmployer(null);
    setIsOpen(false);
  };

  if (hasMounted && isAuthenticated() && loading) {
    return (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[var(--cta-solid)] to-[var(--cta-solid-hover)] flex items-center justify-center animate-pulse ${className}`}>
        <UserIcon className="w-4 h-4 text-[var(--dark-header-text)]" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus-ring"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--cta-solid)] to-[var(--cta-solid-hover)] flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-[var(--dark-header-text)]" />
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-[var(--dark-header-text)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--dark-header-bg)] border border-[var(--dark-header-border)] rounded-card shadow-lg z-50">
          {hasMounted && isAuthenticated() ? (
            // Logged in menu
            <div className="py-2">
              <div className="px-4 py-3 border-b border-[var(--dark-header-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cta-solid)] to-[var(--cta-solid-hover)] flex items-center justify-center">
                    <BuildingIcon className="w-5 h-5 text-[var(--dark-header-text)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[var(--dark-header-text)] truncate">
                      {employer?.company_name || "Company"}
                    </div>
                    <div className="text-xs text-[var(--dark-header-text-muted)] truncate">
                      {employer?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/jobs"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BuildingIcon className="w-4 h-4" />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            // Not logged in menu (or during SSR)
            <div className="py-2">
              <div className="px-4 py-2 border-b border-[var(--dark-header-border)]">
                <h3 className="text-sm font-medium text-[var(--dark-header-text)]">Sign in or create account</h3>
              </div>

              <div className="py-1">
                <Link
                  href="/login?type=employer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BuildingIcon className="w-4 h-4" />
                  Sign in as Employer
                </Link>

                <Link
                  href="/register?type=employer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BuildingIcon className="w-4 h-4" />
                  Sign up as Employer
                </Link>

                <div className="border-t border-[var(--dark-header-border)] my-1"></div>

                <Link
                  href="/login?type=user"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--dark-header-text-muted)] hover:bg-[var(--dark-header-control-hover)] hover:text-[var(--dark-header-text)] transition-colors opacity-60"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  Sign in as End User
                  <span className="text-xs opacity-50">(Coming soon)</span>
                </Link>

                <Link
                  href="/register?type=user"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--dark-header-text-muted)] hover:bg-[var(--dark-header-control-hover)] hover:text-[var(--dark-header-text)] transition-colors opacity-60"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  Sign up as End User
                  <span className="text-xs opacity-50">(Coming soon)</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
