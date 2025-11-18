"use client";

import Link from "next/link";
import {
  SearchIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
  UserIcon,
  BellIcon,
  SettingsIcon,
} from "lucide-react";
import type { Job, Category, SalaryCurrency } from "@jobsmv/types";
import { useAuth } from "@/lib/auth";
import UserDropdown from "@/components/UserDropdown";
import LocationDropdown from "@/components/LocationDropdown";

interface HeaderProps {
  showFilters?: boolean;
  // Filter-related props (only needed when showFilters=true)
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedLocation?: string | null;
  onLocationChange?: (location: string | null) => void;
  workLocation?: string;
  onWorkLocationChange?: (value: string) => void;
  experienceLevel?: string;
  onExperienceLevelChange?: (value: string) => void;
  salaryRange?: [number, number];
  onSalaryRangeChange?: (range: [number, number]) => void;
  salaryCurrency?: SalaryCurrency | "";
  onSalaryCurrencyChange?: (currency: SalaryCurrency | "") => void;
  onShowSettingsPanel?: () => void;
}

export default function Header({
  showFilters = false,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  workLocation,
  onWorkLocationChange,
  experienceLevel,
  onExperienceLevelChange,
  salaryRange = [0, 100000],
  onSalaryRangeChange,
  salaryCurrency = "",
  onSalaryCurrencyChange,
  onShowSettingsPanel,
}: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-[var(--dark-header-bg)] text-[var(--dark-header-text)] border-b border-[var(--dark-header-border)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--dark-header-text)] flex items-center justify-center">
              <BriefcaseIcon className="w-5 h-5 text-[var(--dark-header-bg)]" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              JobsMv
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/"
              className="px-3 py-2.5 text-[var(--dark-header-text)] font-medium border-b-2 border-[var(--dark-header-text)] -mb-[1px] focus-ring"
            >
              Find job
            </Link>
            <Link
              href="#messages"
              className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
            >
              Messages
            </Link>
            <Link
              href="#hiring"
              className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
            >
              Hiring
            </Link>
            <Link
              href="#community"
              className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
            >
              Community
            </Link>
            <Link
              href="#faq"
              className="px-3 py-2.5 text-[var(--dark-header-text-muted)] font-medium hover:text-[var(--dark-header-text)] transition-colors focus-ring"
            >
              FAQ
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {onLocationChange && (
              <LocationDropdown
                selectedLocation={selectedLocation || null}
                onChange={onLocationChange}
              />
            )}
            <UserDropdown />
            {isAuthenticated() && onShowSettingsPanel && (
              <button
                onClick={onShowSettingsPanel}
                className="icon-button !bg-[var(--dark-header-control-bg)] !border-[var(--dark-header-control-border)] text-[var(--dark-header-text)] hover:!bg-[var(--dark-header-control-hover)] focus-ring"
                aria-label="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            )}
            <button
              className="icon-button !bg-[var(--dark-header-control-bg)] !border-[var(--dark-header-control-border)] text-[var(--dark-header-text)] hover:!bg-[var(--dark-header-control-hover)] focus-ring"
              aria-label="Notifications"
            >
              <BellIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar - Filter Row */}
        {showFilters && (
          <div className="py-3 border-t border-[var(--dark-header-border)]">
            <div className="flex items-center gap-3 overflow-x-auto">
              {/* Search */}
              <div className="flex items-center gap-2 px-4 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] min-w-[200px]">
                <SearchIcon className="w-4 h-4 text-[var(--dark-header-text-muted)] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery || ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Designer"
                  aria-label="Search jobs"
                  className="flex-1 bg-transparent text-[var(--dark-header-text)] placeholder:text-[var(--dark-header-text-muted)] outline-none text-sm focus-ring"
                />
                <ChevronDownIcon className="w-4 h-4 text-[var(--dark-header-text-muted)] flex-shrink-0" aria-hidden="true" />
              </div>

              {/* Work Location */}
              <div className="relative">
                <label htmlFor="work-location" className="sr-only">Work location</label>
                <select
                  id="work-location"
                  value={workLocation || ""}
                  onChange={(e) => onWorkLocationChange?.(e.target.value)}
                  className="flex items-center gap-2 pl-10 pr-8 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                >
                  <option value="">Work location</option>
                  <option value="remote">Remote</option>
                  <option value="office">Office</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
              </div>

              {/* Experience */}
              <div className="relative">
                <label htmlFor="experience-level" className="sr-only">Experience level</label>
                <select
                  id="experience-level"
                  value={experienceLevel || ""}
                  onChange={(e) => onExperienceLevelChange?.(e.target.value)}
                  className="flex items-center gap-2 pl-10 pr-8 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                >
                  <option value="">Experience</option>
                  <option value="entry">Entry level</option>
                  <option value="mid">Mid level</option>
                  <option value="senior">Senior level</option>
                </select>
                <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
              </div>

              {/* Payment Type */}
              <div className="relative">
                <label htmlFor="payment-type" className="sr-only">Payment type</label>
                <select
                  id="payment-type"
                  className="flex items-center gap-2 pl-10 pr-8 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] text-sm text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                >
                  <option value="monthly">Per month</option>
                  <option value="hourly">Per hour</option>
                  <option value="annual">Per year</option>
                </select>
                <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
              </div>

              {/* Salary Range */}
              <div className="flex items-center gap-3 px-4 h-10 text-sm text-[var(--dark-header-text)] ml-auto">
                <label htmlFor="salary-range" className="whitespace-nowrap">Salary range</label>
                <div className="flex items-center gap-2">
                  {/* Currency Selector */}
                  <div className="relative">
                    <label htmlFor="salary-currency" className="sr-only">Salary currency</label>
                    <select
                      id="salary-currency"
                      value={salaryCurrency}
                      onChange={(e) => onSalaryCurrencyChange?.(e.target.value as SalaryCurrency | "")}
                      className="flex items-center gap-2 pl-8 pr-6 h-8 w-auto min-w-0 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[12px] text-xs text-[var(--dark-header-text)] hover:bg-[var(--dark-header-control-hover)] transition-colors whitespace-nowrap appearance-none focus-ring"
                    >
                      <option value="">All Currencies</option>
                      <option value="MVR">MVR</option>
                      <option value="USD">USD</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--dark-header-text-muted)] pointer-events-none" aria-hidden="true" />
                  </div>

                  <output htmlFor="salary-range" className="font-semibold" style={{ fontFamily: "var(--font-numeric)" }}>
                    {salaryCurrency === "MVR" ? "MVR" : salaryCurrency === "USD" ? "$" : ""}{salaryRange[0].toLocaleString()}
                  </output>
                  <div className="relative w-24">
                    <input
                      type="range"
                      id="salary-range"
                      min="0"
                      max="100000"
                      step="100"
                      value={salaryRange[1]}
                      onChange={(e) => onSalaryRangeChange?.([salaryRange[0], parseInt(e.target.value)])}
                      aria-label="Maximum salary"
                      className="w-full h-1 bg-[var(--dark-header-control-bg)] rounded-full appearance-none cursor-pointer focus-ring [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--cta-solid)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--dark-header-text)]"
                    />
                  </div>
                  <output htmlFor="salary-range" className="font-semibold" style={{ fontFamily: "var(--font-numeric)" }}>
                    {salaryCurrency === "MVR" ? "MVR" : salaryCurrency === "USD" ? "$" : ""}{salaryRange[1].toLocaleString()}
                  </output>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
