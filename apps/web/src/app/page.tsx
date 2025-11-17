"use client";

import { useEffect, useState } from "react";
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
import type { Job, Category } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import UserDropdown from "@/components/UserDropdown";
import LocationDropdown from "@/components/LocationDropdown";
import ProfileSettingsPanel from "@/components/ProfileSettingsPanel";
import { JobCard } from "@jobsmv/ui-tripled";

const accentColors = ["peach", "mint", "lilac", "blue"] as const;

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [workLocation, setWorkLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryRange, setSalaryRange] = useState([0, 100000]);
  const [salaryCurrency, setSalaryCurrency] = useState<"MVR" | "USD" | "">("");
  const [sortBy, setSortBy] = useState("last_updated");
  
  // Sidebar filter states
  const [workingSchedule, setWorkingSchedule] = useState({
    fullTime: true,
    partTime: true,
    internship: false,
    projectWork: false,
    volunteering: false,
  });

  // Settings panel state
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const { isAuthenticated } = useAuth();

  const [employmentType, setEmploymentType] = useState({
    fullDay: true,
    flexibleSchedule: true,
    shiftWork: false,
    distantWork: true,
    shiftMethod: false,
  });

  const loadJobs = async () => {
    try {
      const jobsData = await apiClient.getPublicJobs({
        location: selectedLocation || undefined,
        ...(salaryRange[0] !== 0 || salaryRange[1] !== 100000 ? {
          salary_min: salaryRange[0],
          salary_max: salaryRange[1],
        } : {}),
        salary_currency: salaryCurrency || undefined,
      });
      setJobs(jobsData.items || []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [jobsData, categoriesData] = await Promise.all([
          apiClient.getPublicJobs({
            location: selectedLocation || undefined,
            ...(salaryRange[0] !== 0 || salaryRange[1] !== 100000 ? {
              salary_min: salaryRange[0],
              salary_max: salaryRange[1],
            } : {}),
            salary_currency: salaryCurrency || undefined,
          }),
          apiClient.getCategories(),
        ]);
        setJobs(jobsData.items || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadJobs();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!loading) {
      loadJobs();
    }
  }, [salaryRange, salaryCurrency]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter jobs based on search query
  };

  const getJobCardColor = (index: number) => {
    const colorIndex = index % accentColors.length;
    const colorMap = {
      peach: "job-card--peach",
      mint: "job-card--mint",
      lilac: "job-card--lilac",
      blue: "job-card--blue",
    };
    return colorMap[accentColors[colorIndex]];
  };

  return (
    <div className="min-h-screen bg-app">
      {/* Dark Navigation Header */}
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
              <LocationDropdown
                selectedLocation={selectedLocation}
                onChange={setSelectedLocation}
              />
              <UserDropdown />
              {isAuthenticated() && (
                <button
                  onClick={() => setShowSettingsPanel(true)}
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
          <div className="py-3 border-t border-[var(--dark-header-border)]">
            <div className="flex items-center gap-3 overflow-x-auto">
              {/* Search */}
              <div className="flex items-center gap-2 px-4 h-10 bg-[var(--dark-header-control-bg)] border border-[var(--dark-header-control-border)] rounded-[16px] min-w-[200px]">
                <SearchIcon className="w-4 h-4 text-[var(--dark-header-text-muted)] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
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
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
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
                      onChange={(e) => setSalaryCurrency(e.target.value as "MVR" | "USD" | "")}
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
                      onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="space-y-6">
            {/* Promotional Card */}
            <div className="sticky top-8 bg-[var(--dark-header-bg)] text-[var(--dark-header-text)] rounded-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cta-solid)] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-accent-card-3)] rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h3
                  className="text-xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Get Your best profession with JobsMv
                </h3>
                <button className="button-cta w-full mt-4">
                  Learn more
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="sticky top-[200px] bg-surface rounded-card p-5 shadow-card border border-subtle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  Filters
                </h3>
                <button className="text-sm text-muted hover:text-primary focus-ring" aria-label="Filter options">
                  <SlidersHorizontalIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Working Schedule */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-primary mb-3">Working schedule</h4>
                <div className="space-y-2">
                  {Object.entries(workingSchedule).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setWorkingSchedule({ ...workingSchedule, [key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-subtle text-[var(--color-ink)] focus-ring"
                      />
                      <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Employment type</h4>
                <div className="space-y-2">
                  {Object.entries(employmentType).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setEmploymentType({ ...employmentType, [key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-subtle text-[var(--color-ink)] focus-ring"
                      />
                      <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side - Job Listings */}
          <main>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Recommended jobs
                </h1>
                <p className="text-sm text-muted">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--chip-bg)] text-primary text-xs font-bold mr-2">
                    {Math.min(jobs.length, 9)}
                  </span>
                  {jobs.length > 9 ? "recommended jobs" : "jobs found"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Sort by:</span>
                <button 
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-[var(--cta-solid)] transition-colors focus-ring"
                  aria-label="Sort by last updated"
                >
                  Last updated
                  <SlidersHorizontalIcon className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Job Cards Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-muted">Loading jobs...</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted">No jobs found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {jobs.slice(0, 9).map((job, index) => {
                    const accentColor = accentColors[index % accentColors.length] as "peach" | "mint" | "lilac" | "blue";
                    return (
                      <Link key={job.id} href={`/jobs/${job.id}`} className="focus-ring">
                        <JobCard 
                          job={job} 
                          accentColor={accentColor}
                          className="hover:scale-[1.02] transition-transform"
                        />
                      </Link>
                    );
                  })}
                </div>
                
                {/* View More Button */}
                {jobs.length > 9 && (
                  <div className="flex justify-center mt-8">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center justify-center h-12 px-8 rounded-pill bg-[var(--cta-solid)] text-[var(--dark-header-text)] text-sm font-semibold hover:bg-[var(--cta-solid-hover)] transition-colors focus-ring"
                    >
                      View More Jobs
                    </Link>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Profile Settings Panel */}
      <ProfileSettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
    </div>
  );
}
