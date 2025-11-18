"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontalIcon } from "lucide-react";
import type { Job, Category, SalaryCurrency } from "@jobsmv/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import ProfileSettingsPanel from "@/components/ProfileSettingsPanel";
import Header from "@/components/Header";
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
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100000]);
  const [salaryCurrency, setSalaryCurrency] = useState<SalaryCurrency | "">("");
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
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

  // Toggle sort between newest (created_at) and recently updated (updated_at)
  const toggleSort = () => {
    const newSortBy = sortBy === 'created_at' ? 'updated_at' : 'created_at';
    setSortBy(newSortBy);
  };

  // Get the current sort label
  const getSortLabel = () => {
    return sortBy === 'created_at' ? 'Newest' : 'Recently Updated';
  };

  const loadJobs = async () => {
    try {
      const jobsData = await apiClient.getPublicJobs({
        location: selectedLocation || undefined,
        ...(salaryRange[0] !== 0 || salaryRange[1] !== 100000 ? {
          salary_min: salaryRange[0],
          salary_max: salaryRange[1],
        } : {}),
        salary_currency: salaryCurrency || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
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
            sort_by: sortBy,
            sort_order: sortOrder,
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
  }, [sortBy]);

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
      <Header
        showFilters={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        workLocation={workLocation}
        onWorkLocationChange={setWorkLocation}
        experienceLevel={experienceLevel}
        onExperienceLevelChange={setExperienceLevel}
        salaryRange={salaryRange}
        onSalaryRangeChange={setSalaryRange}
        salaryCurrency={salaryCurrency}
        onSalaryCurrencyChange={setSalaryCurrency}
        onShowSettingsPanel={() => setShowSettingsPanel(true)}
      />

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
            <div className="sticky top-[200px] mt-6 bg-surface rounded-card p-5 shadow-card border border-subtle">
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
                  onClick={toggleSort}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-[var(--cta-solid)] transition-colors focus-ring"
                  aria-label={`Sort by ${getSortLabel().toLowerCase()}`}
                >
                  {getSortLabel()}
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
