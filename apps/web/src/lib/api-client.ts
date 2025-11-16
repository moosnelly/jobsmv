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
    if (typeof window === "undefined") {
      throw new Error("API client can only be used in the browser");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        mode: "cors",
      });
    } catch (error: unknown) {
      // Handle network errors (server not running, CORS, etc.)
      let errorMessage = "Failed to connect to the API server";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof TypeError) {
        errorMessage = error.message || "Network request failed (possibly CORS or server unreachable)";
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        const errorObj = error as Record<string, unknown>;
        errorMessage = String(errorObj.message || errorObj.toString() || "Unknown network error");
      }
      
      const networkError: ApiError = {
        type: "network_error",
        title: "Network error",
        status: 0,
        detail: `${errorMessage}. Please ensure the API server is running at ${this.baseUrl} and CORS is properly configured.`,
      };
      
      throw networkError;
    }

    if (!response.ok) {
      let error: ApiError;
      try {
        const errorData = await response.json();
        // Handle FastAPI validation errors (array of errors)
        if (Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail
            .map((err: any) => `${err.loc?.join(".") || "field"}: ${err.msg}`)
            .join(", ");
          error = {
            type: "validation_error",
            title: "Validation failed",
            status: response.status,
            detail: validationErrors,
          };
        }
        // Handle FastAPI error format (can be {"detail": "..."} or full ProblemDetail)
        else if (errorData.detail && !errorData.type) {
          error = {
            type: "http_error",
            title: "Request failed",
            status: response.status,
            detail: typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail),
          };
        } else {
          error = errorData as ApiError;
        }
      } catch {
        error = {
          type: "unknown",
          title: "Request failed",
          status: response.status,
          detail: response.statusText,
        };
      }
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
    const result = await this.request<{ access_token: string; token_type: string; employer_id: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    this.setToken(result.access_token);
    return result;
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

