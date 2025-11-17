# Cache Components Examples

This document provides concrete examples of what should and shouldn't be cached in the JobsMv application.

## ✅ CACHEABLE Components

### 1. Public Job Detail Pages
```tsx
// apps/web/src/app/(public)/jobs/[id]/page.tsx
"use cache";

import { Suspense } from "react";
import JobDetailServer from "./JobDetailServer";

// Cache for 1 hour (job details don't change frequently)
export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs"];
export const dynamic = "force-static";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <JobDetailServer jobId={params.id} />
    </Suspense>
  );
}
```

**Why cached:**
- ✓ Public-facing content
- ✓ No user-specific data
- ✓ Job details change infrequently
- ✓ High traffic pages that benefit from caching

---

### 2. Job Listings Server Component
```tsx
// apps/web/src/app/(public)/jobs/page.tsx
"use cache";

import JobsPageClient from "./JobsPageClient";
import { getCategoriesServer, getPublicJobsServer } from "@/lib/server-api";

// Cache for 1 hour
export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs", "categories"];

export default async function JobsPage() {
  // Pre-fetch on server and cache the response
  const [jobsResponse, categories] = await Promise.all([
    getPublicJobsServer(),
    getCategoriesServer(),
  ]);

  return (
    <JobsPageClient
      initialCategories={categories}
      initialPaginationState={{
        jobs: jobsResponse.items,
        loading: false,
        error: null,
        hasNextPage: Boolean(jobsResponse.next_cursor),
      }}
    />
  );
}
```

**Why cached:**
- ✓ Initial data load is cacheable
- ✓ Reduces backend API calls
- ✓ Client component handles dynamic filtering
- ✓ Fast initial page load

---

### 3. Reusable Server Components
```tsx
// apps/web/src/components/CachedJobsSection.tsx
"use cache";

import { getPublicJobsServer } from "@/lib/server-api";

// Cache for 1 hour
export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs"];

export async function CachedJobsSection() {
  const jobsData = await getPublicJobsServer();
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {jobsData.items.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

**Why cached:**
- ✓ Pure data display
- ✓ No user interaction
- ✓ Can be embedded anywhere
- ✓ Static content

---

### 4. Static Landing Page Sections
```tsx
// Example: Hero section
"use cache";

export const revalidate = 86400; // Cache for 24 hours

export function HeroSection() {
  return (
    <section>
      <h1>Find Your Dream Job in Maldives</h1>
      <p>Browse thousands of job opportunities...</p>
    </section>
  );
}
```

**Why cached:**
- ✓ Static marketing content
- ✓ Changes very rarely
- ✓ Same for all users
- ✓ Long cache time appropriate

---

## ❌ DO NOT CACHE - Dynamic Components

### 1. Authentication Pages
```tsx
// apps/web/src/app/(auth)/login/page.tsx
"use client";

// NO CACHING - This is dynamic
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
}
```

**Why NOT cached:**
- ✗ User authentication flow
- ✗ Session-dependent
- ✗ Security concerns
- ✗ Different for each user

---

### 2. Employer Dashboard
```tsx
// apps/web/src/app/(dashboard)/dashboard/jobs/page.tsx
"use client";

// NO CACHING - Employer-specific data
export const dynamic = "force-dynamic";

export default function DashboardJobsPage() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Load employer's specific jobs
    loadMyJobs();
  }, []);

  return <DashboardShell>{/* Employer's jobs */}</DashboardShell>;
}
```

**Why NOT cached:**
- ✗ Employer-specific data
- ✗ Requires authentication
- ✗ Real-time updates needed
- ✗ Different for each employer

---

### 3. Application Forms
```tsx
// apps/web/src/app/(public)/apply/[id]/page.tsx
"use client";

// NO CACHING - User input form
export const dynamic = "force-dynamic";

export default function ApplyPage() {
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      {/* Application form */}
    </form>
  );
}
```

**Why NOT cached:**
- ✗ User input form
- ✗ Submission state
- ✗ Request-specific data
- ✗ Can't cache POST forms

---

### 4. Interactive Client Components
```tsx
// apps/web/src/components/JobFiltersPanel.tsx
"use client";

// NO CACHING - Interactive UI
export function JobFiltersPanel({ onFiltersChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* More filters */}
    </div>
  );
}
```

**Why NOT cached:**
- ✗ User interactions
- ✗ State management
- ✗ Browser events
- ✗ Must be client component

---

## ⚠️ HYBRID Approach - Best of Both Worlds

### Server Component (Cached) + Client Component (Interactive)

```tsx
// Server Component (Cached)
// apps/web/src/app/some-page/page.tsx
"use cache";

export const revalidate = 3600;
export const tags = ["data"];

export default async function Page() {
  // Fetch cacheable data on server
  const data = await getDataFromAPI();
  
  // Pass to client component
  return <InteractiveClient initialData={data} />;
}
```

```tsx
// Client Component (Interactive)
// apps/web/src/app/some-page/InteractiveClient.tsx
"use client";

export default function InteractiveClient({ initialData }) {
  const [filteredData, setFilteredData] = useState(initialData);
  
  // Handle user interactions, filtering, etc.
  return <div>{/* Interactive UI */}</div>;
}
```

**Benefits:**
- ✓ Fast initial load (cached server data)
- ✓ SEO-friendly (server-rendered)
- ✓ Still interactive (client-side logic)
- ✓ Reduced API calls

---

## Cache Revalidation Examples

### When Employer Creates/Updates Job

```tsx
// In job creation/update handler
import { revalidateJobs } from "@/lib/cache-revalidation";

async function handleJobUpdate() {
  // Update job in database
  await apiClient.updateJob(jobId, data);
  
  // Invalidate cache
  await revalidateJobs();
}
```

### When Admin Updates Categories

```tsx
import { revalidateCategories } from "@/lib/cache-revalidation";

async function handleCategoryUpdate() {
  // Update category
  await updateCategory(categoryId, data);
  
  // Invalidate cache
  await revalidateCategories();
}
```

---

## Decision Tree

```
Should this component be cached?
│
├─ Is it public-facing? ─────────────────────────── NO ──→ ❌ Don't cache
│   │
│   YES
│   │
├─ Does it require authentication? ───────────────── YES ─→ ❌ Don't cache
│   │
│   NO
│   │
├─ Is it the same for all users? ─────────────────── NO ──→ ❌ Don't cache
│   │
│   YES
│   │
├─ Does it handle form submissions? ───────────────── YES ─→ ❌ Don't cache
│   │
│   NO
│   │
├─ Does it use client-side state/events? ─────────── YES ─→ Use hybrid approach
│   │
│   NO
│   │
└─ ✅ CACHE IT!
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Cache user-specific data
```tsx
// WRONG - Don't cache logged-in user's data
"use cache";
export default async function MyProfilePage() {
  const user = await getCurrentUser(); // Different for each user!
  return <div>{user.name}</div>;
}
```

### ✅ DO: Keep user pages dynamic
```tsx
// CORRECT
"use client";
export const dynamic = "force-dynamic";

export default function MyProfilePage() {
  const { user } = useAuth();
  return <div>{user.name}</div>;
}
```

---

### ❌ DON'T: Cache interactive forms
```tsx
// WRONG - Don't cache forms
"use cache";
export default function ContactForm() {
  return <form>...</form>; // Forms need client-side handling!
}
```

### ✅ DO: Use client components for forms
```tsx
// CORRECT
"use client";

export default function ContactForm() {
  const [formData, setFormData] = useState({});
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Summary

### ✅ CACHE THESE:
- Public job listings
- Job detail pages
- Categories/locations
- Static marketing content
- Any public, unchanging data

### ❌ DON'T CACHE THESE:
- Auth pages (login, register)
- Dashboard pages
- User-specific data
- Forms
- Components with state/events
- Real-time data

### ⚠️ HYBRID APPROACH:
- Pages with both static and interactive parts
- Server component fetches cached data
- Client component handles interactivity
