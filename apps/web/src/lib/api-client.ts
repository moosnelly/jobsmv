import type { Job, JobPublic, JobSalary, SupportedCurrency, Application, Category, Employer, ApiError } from "@jobsmv/types";

export type AtollLocation = {
  atoll: string;
  islands: string[];
};

export type LocationsResponse = {
  locations: AtollLocation[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;
  private tokenExpiry: number | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // In a real app, get tokens from secure storage (httpOnly cookie preferred)
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("auth_token");
      this.refreshToken = localStorage.getItem("refresh_token");
      // Initialize token expiry from stored token
      if (this.accessToken) {
        this.tokenExpiry = this.getTokenExpiry(this.accessToken);
      }
    }
  }

  setTokens(accessToken: string | null, refreshToken: string | null = null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = accessToken ? this.getTokenExpiry(accessToken) : null;

    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
      } else {
        localStorage.removeItem("auth_token");
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
    }
  }

  // For backward compatibility
  setToken(token: string | null) {
    this.setTokens(token, this.refreshToken);
  }

  private getTokenExpiry(token: string): number | null {
    try {
      // Decode JWT payload (base64url decode)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decodedPayload.exp ? decodedPayload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.warn('Failed to decode token expiry:', error);
      return null;
    }
  }

  private isTokenExpiringSoon(): boolean {
    if (!this.tokenExpiry) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // Refresh if token expires within 5 minutes
    return (this.tokenExpiry - now) < fiveMinutes;
  }

  private async refreshTokens(): Promise<{ access_token: string; refresh_token: string }> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: this.refreshToken,
      }),
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      // If refresh fails, clear tokens and redirect to login
      this.setTokens(null, null);
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (typeof window === "undefined") {
      throw new Error("API client can only be used in the browser");
    }

    // Proactively refresh token if it's expiring soon
    if (this.accessToken && this.refreshToken && this.isTokenExpiringSoon()) {
      try {
        await this.refreshTokens();
      } catch (error) {
        console.warn('Proactive token refresh failed:', error);
        // Continue with the request even if proactive refresh fails
        // The reactive refresh logic will handle it if needed
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

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

    // Handle 401 Unauthorized - try to refresh token automatically
    if (response.status === 401 && this.refreshToken && !(options.headers as any)?.["X-Skip-Refresh"]) {
      try {
        // Prevent multiple concurrent refresh attempts
        if (this.isRefreshing) {
          await this.refreshPromise;
        } else {
          this.isRefreshing = true;
          this.refreshPromise = this.refreshTokens();
          await this.refreshPromise;
          this.isRefreshing = false;
          this.refreshPromise = null;
        }

        // Retry the original request with new token
        return this.request<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            "X-Skip-Refresh": "true", // Prevent infinite refresh loops
          },
        });
      } catch (refreshError) {
        this.isRefreshing = false;
        this.refreshPromise = null;
        // If refresh fails, the user will be redirected to login
        throw refreshError;
      }
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
    const result = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      employer_id: string;
    }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    this.setTokens(result.access_token, result.refresh_token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      employer_id: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(result.access_token, result.refresh_token);
    return result;
  }

  logout() {
    this.setTokens(null, null);
  }

  // Public job endpoints
  async getPublicJobs(params?: {
    cursor?: string;
    q?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: "MVR" | "USD";
    sort_by?: "created_at" | "updated_at";
    sort_order?: "asc" | "desc";
  }) {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append("cursor", params.cursor);
    if (params?.q) searchParams.append("q", params.q);
    if (params?.location) searchParams.append("location", params.location);
    if (params?.salary_min !== undefined) searchParams.append("salary_min", params.salary_min.toString());
    if (params?.salary_max !== undefined) searchParams.append("salary_max", params.salary_max.toString());
    if (params?.salary_currency) searchParams.append("salary_currency", params.salary_currency);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.append("sort_order", params.sort_order);

    return this.request<{ items: JobPublic[]; next_cursor?: string | null }>(
      `/public/jobs?${searchParams.toString()}`
    );
  }

  async getLocations() {
    const response = await this.request<LocationsResponse>("/public/locations");
    return response.locations;
  }

  async getPublicJob(jobId: string) {
    return this.request<JobPublic>(`/public/jobs/${jobId}`);
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

  async updateEmployer(data: Partial<Employer>) {
    return this.request<Employer>("/employers/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
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
    is_salary_public: boolean;
    salaries: JobSalary[];
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
    is_salary_public?: boolean;
    salaries?: JobSalary[];
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

