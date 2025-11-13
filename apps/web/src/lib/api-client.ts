import type { Job, Application, Category, Employer, ApiError } from "@jobsmv/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // In a real app, get token from secure storage (httpOnly cookie preferred)
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        type: "unknown",
        title: "Request failed",
        status: response.status,
        detail: response.statusText,
      }));
      throw error;
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    company_name: string;
    email: string;
    password: string;
    contact_info?: Record<string, unknown>;
  }) {
    return this.request<{ access_token: string; token_type: string; employer_id: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      access_token: string;
      token_type: string;
      employer_id: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.access_token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Public job endpoints
  async getPublicJobs(params?: {
    cursor?: string;
    q?: string;
    location?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append("cursor", params.cursor);
    if (params?.q) searchParams.append("q", params.q);
    if (params?.location) searchParams.append("location", params.location);

    return this.request<{ items: Job[]; next_cursor?: string | null }>(
      `/public/jobs?${searchParams.toString()}`
    );
  }

  async getPublicJob(jobId: string) {
    return this.request<Job>(`/public/jobs/${jobId}`);
  }

  async applyToJob(jobId: string, data: {
    applicant_name: string;
    applicant_email: string;
    resume_url?: string;
    cover_letter_md?: string;
  }) {
    return this.request<Application>(`/public/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Employer endpoints
  async getCurrentEmployer() {
    return this.request<Employer>("/employers/me");
  }

  // Job endpoints (employer-scoped)
  async getJobs(params?: {
    cursor?: string;
    q?: string;
    location?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append("cursor", params.cursor);
    if (params?.q) searchParams.append("q", params.q);
    if (params?.location) searchParams.append("location", params.location);
    if (params?.status) searchParams.append("status", params.status);

    return this.request<{ items: Job[]; next_cursor?: string | null }>(
      `/jobs?${searchParams.toString()}`
    );
  }

  async getJob(jobId: string) {
    return this.request<Job>(`/jobs/${jobId}`);
  }

  async createJob(data: {
    title: string;
    description_md: string;
    requirements_md?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    tags?: string[];
    category_ids?: string[];
  }) {
    return this.request<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateJob(jobId: string, data: Partial<{
    title: string;
    description_md: string;
    requirements_md?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    status?: string;
    tags?: string[];
    category_ids?: string[];
  }>) {
    return this.request<Job>(`/jobs/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(jobId: string) {
    return this.request<void>(`/jobs/${jobId}`, {
      method: "DELETE",
    });
  }

  // Application endpoints
  async getJobApplications(jobId: string, params?: {
    cursor?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append("cursor", params.cursor);
    if (params?.status) searchParams.append("status", params.status);

    return this.request<{ items: Application[]; next_cursor?: string | null }>(
      `/jobs/${jobId}/applications?${searchParams.toString()}`
    );
  }

  async getApplication(applicationId: string) {
    return this.request<Application>(`/applications/${applicationId}`);
  }

  async updateApplication(applicationId: string, data: {
    status?: string;
    notes?: string;
  }) {
    return this.request<Application>(`/applications/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Category endpoints
  async getCategories() {
    return this.request<Category[]>("/categories");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

