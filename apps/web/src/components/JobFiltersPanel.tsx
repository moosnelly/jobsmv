"use client";

import React, { useState, useEffect } from "react";
import {
  SearchIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import type { SalaryCurrency, Category } from "@jobsmv/types";
import type { JobFilters } from "@/lib/hooks";

interface JobFiltersPanelProps {
  filters: JobFilters;
  onFiltersChange: (filters: Partial<JobFilters>) => void;
  onClearFilters: () => void;
  categories?: Category[];
  className?: string;
}

export function JobFiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  categories = [],
  className = "",
}: JobFiltersPanelProps) {
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [selectedLocation, setSelectedLocation] = useState(filters.location || "");
  const [selectedCategory, setSelectedCategory] = useState(filters.category || "");
  const [workLocation, setWorkLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryRange, setSalaryRange] = useState([
    filters.salary_min || 0,
    filters.salary_max || 200000,
  ]);
  const [salaryCurrency, setSalaryCurrency] = useState<SalaryCurrency | "">(
    filters.salary_currency || ""
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.q) {
        onFiltersChange({ q: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.q, onFiltersChange]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    onFiltersChange({ location });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFiltersChange({ category });
  };

  const handleSalaryChange = (min: number, max: number, currency: SalaryCurrency | "") => {
    setSalaryRange([min, max]);
    setSalaryCurrency(currency);
    onFiltersChange({
      salary_min: min,
      salary_max: max,
      salary_currency: currency || undefined,
    });
  };

  const hasActiveFilters =
    filters.q ||
    filters.location ||
    filters.category ||
    filters.salary_min ||
    filters.salary_max ||
    filters.salary_currency;

  return (
    <div className={`bg-surface rounded-card p-6 shadow-card border border-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors focus-ring"
          >
            <XIcon className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label htmlFor="job-search" className="block text-sm font-semibold text-primary mb-3">
            Search jobs
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="job-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title, company, or keywords"
              className="w-full pl-10 pr-4 h-12 bg-[var(--control-fill)] border border-subtle rounded-[12px] text-primary placeholder:text-muted focus-ring focus:border-[var(--cta-solid)]"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="job-location" className="block text-sm font-semibold text-primary mb-3">
            Location
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              id="job-location"
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-[var(--control-fill)] border border-subtle rounded-[12px] text-primary appearance-none focus-ring focus:border-[var(--cta-solid)]"
            >
              <option value="">Any location</option>
              <option value="maldives">Maldives</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div>
            <label htmlFor="job-category" className="block text-sm font-semibold text-primary mb-3">
              Category
            </label>
            <div className="relative">
              <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <select
                id="job-category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pl-10 pr-10 h-12 bg-[var(--control-fill)] border border-subtle rounded-[12px] text-primary appearance-none focus-ring focus:border-[var(--cta-solid)]"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>
        )}

        {/* Work Location */}
        <div>
          <label htmlFor="work-location-type" className="block text-sm font-semibold text-primary mb-3">
            Work location type
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              id="work-location-type"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-[var(--control-fill)] border border-subtle rounded-[12px] text-primary appearance-none focus-ring focus:border-[var(--cta-solid)]"
            >
              <option value="">Any type</option>
              <option value="office">Office</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experience-level" className="block text-sm font-semibold text-primary mb-3">
            Experience level
          </label>
          <div className="relative">
            <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              id="experience-level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-[var(--control-fill)] border border-subtle rounded-[12px] text-primary appearance-none focus-ring focus:border-[var(--cta-solid)]"
            >
              <option value="">Any experience</option>
              <option value="entry">Entry level</option>
              <option value="mid">Mid level</option>
              <option value="senior">Senior level</option>
              <option value="executive">Executive</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-3">
            Salary range
          </label>
          <div className="space-y-4">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={salaryCurrency}
                onChange={(e) => handleSalaryChange(salaryRange[0], salaryRange[1], e.target.value as SalaryCurrency | "")}
                className="w-full pl-3 pr-10 h-10 bg-[var(--control-fill)] border border-subtle rounded-[8px] text-primary text-sm appearance-none focus-ring focus:border-[var(--cta-solid)]"
              >
                <option value="">Any currency</option>
                <option value="MVR">Maldivian Rufiyaa (MVR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            {/* Salary Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="salary-min" className="sr-only">Minimum salary</label>
                <input
                  id="salary-min"
                  type="number"
                  placeholder="Min"
                  value={salaryRange[0] || ""}
                  onChange={(e) => handleSalaryChange(parseInt(e.target.value) || 0, salaryRange[1], salaryCurrency)}
                  className="w-full h-10 px-3 bg-[var(--control-fill)] border border-subtle rounded-[8px] text-primary text-sm placeholder:text-muted focus-ring focus:border-[var(--cta-solid)]"
                />
              </div>
              <div>
                <label htmlFor="salary-max" className="sr-only">Maximum salary</label>
                <input
                  id="salary-max"
                  type="number"
                  placeholder="Max"
                  value={salaryRange[1] || ""}
                  onChange={(e) => handleSalaryChange(salaryRange[0], parseInt(e.target.value) || 200000, salaryCurrency)}
                  className="w-full h-10 px-3 bg-[var(--control-fill)] border border-subtle rounded-[8px] text-primary text-sm placeholder:text-muted focus-ring focus:border-[var(--cta-solid)]"
                />
              </div>
            </div>

            {/* Display current range */}
            {(salaryRange[0] > 0 || salaryRange[1] < 200000) && (
              <div className="text-sm text-muted">
                {salaryCurrency === "MVR" ? "MVR" : salaryCurrency === "USD" ? "$" : ""}
                {salaryRange[0].toLocaleString()} - {" "}
                {salaryCurrency === "MVR" ? "MVR" : salaryCurrency === "USD" ? "$" : ""}
                {salaryRange[1].toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
