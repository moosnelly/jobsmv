// Shared TypeScript types across the monorepo

export interface ApiError {
  type: string;
  title: string;
  status: number;
  code?: string;
  detail?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor?: string | null;
}

export interface Job {
  id: string;
  employer_id: string;
  employer_company_name?: string;
  title: string;
  description_md: string;
  requirements_md?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  status: "draft" | "published" | "closed";
  categories?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: string;
  company_name: string;
  email: string;
  contact_info?: Record<string, unknown>;
  created_at: string;
}

export interface Application {
  id: string;
  employer_id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_url?: string;
  cover_letter_md?: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

