import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Employer, Job, Application } from "@jobsmv/types";

interface Cache<T> {
  data: T | null;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const employerCache: Cache<Employer> = {
  data: null,
  timestamp: 0,
  loading: false,
  error: null,
};

const jobsCache: Cache<Job[]> = {
  data: null,
  timestamp: 0,
  loading: false,
  error: null,
};

const applicationsCacheByJob = new Map<string, Cache<Application[]>>();

function isCacheValid<T>(cache: Cache<T>): boolean {
  return (
    cache.data !== null &&
    Date.now() - cache.timestamp < CACHE_DURATION &&
    !cache.error
  );
}

async function fetchJobApplicationsWithCache(
  jobId: string,
  options: { force?: boolean } = {}
): Promise<Application[]> {
  const { force = false } = options;
  const cache = applicationsCacheByJob.get(jobId);

  if (!force && cache && isCacheValid(cache)) {
    return cache.data ?? [];
  }

  const response = await apiClient.getJobApplications(jobId);
  const applications = response.items;

  applicationsCacheByJob.set(jobId, {
    data: applications,
    timestamp: Date.now(),
    loading: false,
    error: null,
  });

  return applications;
}

export async function preloadJobApplications(
  jobIds: string[],
  options: { force?: boolean } = {}
): Promise<Record<string, Application[]>> {
  const uniqueJobIds = Array.from(new Set(jobIds.filter((id) => !!id)));

  const results = await Promise.all(
    uniqueJobIds.map(async (jobId) => {
      const applications = await fetchJobApplicationsWithCache(jobId, options);
      return [jobId, applications] as const;
    })
  );

  return Object.fromEntries(results);
}

export function useEmployer() {
  const { isAuthenticated, logout } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(employerCache.data);
  const [loading, setLoading] = useState(employerCache.loading);
  const [error, setError] = useState<string | null>(employerCache.error);
  const fetchingRef = useRef(false);

  const loadEmployer = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }

    // Check if cache is valid
    if (isCacheValid(employerCache)) {
      setEmployer(employerCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent duplicate fetches
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      employerCache.loading = true;

      const employerData = await apiClient.getCurrentEmployer();

      employerCache.data = employerData;
      employerCache.timestamp = Date.now();
      employerCache.error = null;
      employerCache.loading = false;

      setEmployer(employerData);
    } catch (error) {
      console.error("Failed to load employer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load employer data";

      employerCache.error = errorMessage;
      employerCache.loading = false;
      setError(errorMessage);

      if ((error as any).status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, logout]);

  const updateEmployer = useCallback(
    async (data: Partial<Employer>) => {
      try {
        const updatedEmployer = await apiClient.updateEmployer(data);

        // Update cache
        employerCache.data = updatedEmployer;
        employerCache.timestamp = Date.now();
        employerCache.error = null;

        setEmployer(updatedEmployer);
        return updatedEmployer;
      } catch (error) {
        console.error("Failed to update employer:", error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    loadEmployer();
  }, [loadEmployer]);

  return {
    employer,
    loading,
    error,
    refetch: loadEmployer,
    updateEmployer,
  };
}

export function useEmployerJobs() {
  const { isAuthenticated, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(jobsCache.data || []);
  const [loading, setLoading] = useState(jobsCache.loading);
  const [error, setError] = useState<string | null>(jobsCache.error);
  const fetchingRef = useRef(false);

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }

    // Check if cache is valid
    if (isCacheValid(jobsCache)) {
      setJobs(jobsCache.data || []);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent duplicate fetches
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      jobsCache.loading = true;

      const response = await apiClient.getJobs();
      const jobsData = response.items;

      jobsCache.data = jobsData;
      jobsCache.timestamp = Date.now();
      jobsCache.error = null;
      jobsCache.loading = false;

      setJobs(jobsData);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load jobs";

      jobsCache.error = errorMessage;
      jobsCache.loading = false;
      setError(errorMessage);

      if ((error as any).status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, logout]);

  const deleteJob = useCallback(
    async (jobId: string) => {
      try {
        await apiClient.deleteJob(jobId);

        // Update cache
        if (jobsCache.data) {
          jobsCache.data = jobsCache.data.filter((job) => job.id !== jobId);
          jobsCache.timestamp = Date.now();
          setJobs(jobsCache.data);
        }
      } catch (error) {
        console.error("Failed to delete job:", error);
        throw error;
      }
    },
    []
  );

  const updateJobStatus = useCallback(
    async (jobId: string, status: string) => {
      try {
        await apiClient.updateJob(jobId, { status });

        // Update cache
        if (jobsCache.data) {
          jobsCache.data = jobsCache.data.map((job) =>
            job.id === jobId ? { ...job, status: status as Job["status"] } : job
          );
          jobsCache.timestamp = Date.now();
          setJobs(jobsCache.data);
        }
      } catch (error) {
        console.error("Failed to update job status:", error);
        throw error;
      }
    },
    []
  );

  const invalidateCache = useCallback(() => {
    jobsCache.data = null;
    jobsCache.timestamp = 0;
    jobsCache.error = null;
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: loadJobs,
    deleteJob,
    updateJobStatus,
    invalidateCache,
  };
}

export function useEmployerJob(jobId: string | null) {
  const { isAuthenticated, logout } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    if (!isAuthenticated() || !jobId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const jobData = await apiClient.getJob(jobId);
      setJob(jobData);
    } catch (error) {
      console.error("Failed to load job:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load job";
      setError(errorMessage);

      if ((error as any).status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [jobId, isAuthenticated, logout]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  return {
    job,
    loading,
    error,
    refetch: loadJob,
  };
}

export function useJobApplications(jobId: string | null) {
  const { isAuthenticated, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const loadApplications = useCallback(
    async (force = false) => {
      if (!isAuthenticated() || !jobId) {
        setLoading(false);
        return;
      }

      if (!force) {
        const cache = applicationsCacheByJob.get(jobId);
        if (cache && isCacheValid(cache)) {
          setApplications(cache.data ?? []);
          setLoading(false);
          setError(null);
          return;
        }
      }

      if (fetchingRef.current) {
        return;
      }

      try {
        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        const applicationsData = await fetchJobApplicationsWithCache(jobId, { force });
        setApplications(applicationsData);
      } catch (error) {
        console.error("Failed to load applications:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load applications";
        setError(errorMessage);

        if ((error as any).status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [isAuthenticated, jobId, logout]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: string) => {
      if (!jobId) return;

      try {
        await apiClient.updateApplication(applicationId, { status });

        const updatedApplications = applications.map((app) =>
          app.id === applicationId
            ? { ...app, status: status as Application["status"] }
            : app
        );

        setApplications(updatedApplications);

        const cache = applicationsCacheByJob.get(jobId);
        if (cache) {
          cache.data = updatedApplications;
          cache.timestamp = Date.now();
        }
      } catch (error) {
        console.error("Failed to update application status:", error);
        throw error;
      }
    },
    [jobId, applications]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    loading,
    error,
    refetch: () => loadApplications(true),
    updateApplicationStatus,
  };
}

export function clearAllCaches() {
  employerCache.data = null;
  employerCache.timestamp = 0;
  employerCache.error = null;

  jobsCache.data = null;
  jobsCache.timestamp = 0;
  jobsCache.error = null;

  applicationsCacheByJob.clear();
}
