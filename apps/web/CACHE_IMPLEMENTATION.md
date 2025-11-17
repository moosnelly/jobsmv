# Cache Components Implementation (Next.js 16)

This document describes the cache implementation using Next.js 16's "use cache" directive and caching APIs.

## Configuration

### Next.js Config
The `next.config.js` has been updated to enable Cache Components:

```js
experimental: {
  cacheComponents: true,
}
```

## Cached Components and Pages

### 1. Job Detail Page (`/jobs/[id]`)
**File:** `apps/web/src/app/(public)/jobs/[id]/page.tsx` and `JobDetailServer.tsx`

**Why cached:**
- Job details change infrequently
- Static content suitable for caching
- Public-facing page with no user-specific data

**Cache directives:**
- `"use cache"` - Enables caching for the component
- `revalidate: 3600` - Revalidate every hour
- `fetchCache: "default-cache"` - Use default cache behavior
- `tags: ["jobs"]` - Tagged for selective invalidation
- `dynamic: "force-static"` - Force static generation

**How it works:**
- Server component fetches job data using `getPublicJobServer()`
- Data is cached for 1 hour
- Can be revalidated using `revalidateTag("jobs")`

### 2. Jobs Listing Page (`/jobs`)
**File:** `apps/web/src/app/(public)/jobs/page.tsx`

**Why cached:**
- Job listings change infrequently
- Initial data load can be cached
- Reduces API calls to backend

**Cache directives:**
- `"use cache"` - Enables caching
- `revalidate: 3600` - Revalidate every hour
- `fetchCache: "default-cache"` - Use default cache behavior
- `tags: ["jobs", "categories"]` - Tagged for jobs and categories

**How it works:**
- Server component pre-fetches initial jobs and categories
- Passes initial data to client component
- Client component handles filtering/pagination dynamically
- Initial page load is cached

### 3. Cached Jobs Section Component
**File:** `apps/web/src/components/CachedJobsSection.tsx`

**Why cached:**
- Reusable component for showing job listings
- Can be embedded in various pages
- Static job data suitable for caching

**Cache directives:**
- `"use cache"` - Enables caching
- `revalidate: 3600` - Revalidate every hour
- `fetchCache: "default-cache"` - Use default cache behavior
- `tags: ["jobs"]` - Tagged for selective invalidation

## Server-Side Data Fetching

### Server API Module
**File:** `apps/web/src/lib/server-api.ts`

Provides server-side functions for fetching data with caching:

#### `getPublicJobsServer()`
- Fetches public job listings
- Cache: 1 hour (3600s)
- Tags: `["jobs"]`

#### `getPublicJobServer(jobId)`
- Fetches single job detail
- Cache: 1 hour (3600s)
- Tags: `["jobs"]`

#### `getCategoriesServer()`
- Fetches job categories
- Cache: 24 hours (86400s)
- Tags: `["categories"]`
- Rationale: Categories change very rarely

#### `getLocationsServer()`
- Fetches location/atoll data
- Cache: 24 hours (86400s)
- Tags: `["locations"]`
- Rationale: Locations change very rarely

## Cache Revalidation

### Revalidation Module
**File:** `apps/web/src/lib/cache-revalidation.ts`

Provides server actions for cache invalidation:

```ts
import { revalidateJobs } from "@/lib/cache-revalidation";

// When an employer creates/updates/deletes a job:
await revalidateJobs();
```

**Available functions:**
- `revalidateJobs()` - Invalidate job listings and details
- `revalidateCategories()` - Invalidate categories
- `revalidateLocations()` - Invalidate locations
- `revalidateAllPublicData()` - Invalidate all public data

### When to Revalidate

**Jobs should be revalidated when:**
- Employer creates a new job
- Employer updates job details
- Employer publishes/unpublishes a job
- Employer deletes a job

**Categories should be revalidated when:**
- Admin adds/updates/deletes categories

**Locations should be revalidated when:**
- Admin updates location/atoll data

## Components That Remain Dynamic (No Caching)

### Authentication Pages
**Location:** `apps/web/src/app/(auth)/*`

**Why not cached:**
- User-specific authentication flow
- Session-dependent
- Security concerns

### Dashboard Pages
**Location:** `apps/web/src/app/(dashboard)/*`

**Why not cached:**
- Employer-specific data
- Requires authentication
- Real-time updates needed
- User actions (create, edit, delete)

**Directives used:**
```ts
export const dynamic = "force-dynamic";
```

### Application Forms
**Location:** `apps/web/src/app/(public)/apply/*`

**Why not cached:**
- User input forms
- Submission state
- Request-specific data

### Interactive UI Components

The following client components remain dynamic (use client):
- `JobsPageClient` - Handles filtering, search, pagination
- `UserDropdown` - User-specific menu
- `LocationDropdown` - Interactive dropdown with search
- `JobFiltersPanel` - Filter controls
- `JobList` - Manages job display and pagination
- `ProfileSettingsPanel` - User settings

**Why not cached:**
- Require client-side interactivity
- Use browser APIs (localStorage, events)
- Manage state and user input
- Need access to authentication context

## Architecture Pattern

### Hybrid Server + Client Pattern

For pages with both static and dynamic content:

```tsx
// page.tsx (Server Component with cache)
"use cache";

export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs"];

export default async function Page() {
  // Fetch static data on server
  const data = await getDataFromAPI();
  
  // Pass to client component
  return <ClientComponent initialData={data} />;
}
```

```tsx
// ClientComponent.tsx (Client Component)
"use client";

export default function ClientComponent({ initialData }) {
  // Use initialData for hydration
  // Handle user interactions
  // Manage state
}
```

### Benefits of This Pattern

1. **Fast Initial Load** - Cached server-side data
2. **SEO-Friendly** - Server-rendered content
3. **Interactive** - Client-side filtering/pagination
4. **Reduced API Calls** - Cached responses
5. **Flexible** - Can invalidate cache when needed

## Cache Flow Diagram

```
User Request → Next.js Cache Check → Cache Hit? 
                                     ├─ Yes → Return Cached Data
                                     └─ No  → Fetch from API
                                             → Cache Response
                                             → Return Data

Cache Invalidation (on job update):
Employer Action → revalidateTag("jobs") → Clear Cache → Next Request Fetches Fresh Data
```

## Performance Benefits

1. **Reduced Backend Load** - Fewer API calls to FastAPI backend
2. **Faster Page Loads** - Cached responses served instantly
3. **Better User Experience** - Instant navigation for cached pages
4. **Scalability** - Can handle more traffic with cached content

## Best Practices Applied

1. ✅ **Separate Static from Dynamic** - Only cache truly static/semi-static content
2. ✅ **Use Tags for Invalidation** - Easy selective cache clearing
3. ✅ **Appropriate Revalidation Times** - 1h for jobs, 24h for categories
4. ✅ **Never Cache Auth/User Data** - Security and privacy maintained
5. ✅ **Client-Side Interactivity Preserved** - Filters, search work as before
6. ✅ **Server Actions for Revalidation** - Safe cache invalidation
7. ✅ **Documentation** - Clear explanation of what and why

## Testing Cache

### Verify Cache is Working

1. **Check Response Times:**
   ```bash
   # First request (cache miss)
   time curl http://localhost:3000/jobs/[id]
   
   # Second request (cache hit - should be faster)
   time curl http://localhost:3000/jobs/[id]
   ```

2. **Check Revalidation:**
   ```bash
   # Create a new job in dashboard
   # Then check if /jobs page shows it after revalidation
   ```

3. **Check Headers:**
   - Look for `x-nextjs-cache` header in responses
   - Values: `HIT`, `MISS`, `STALE`

## Future Enhancements

1. **Employer Listings Page** - Add caching when implemented
2. **Homepage Sections** - Cache individual hero/feature sections
3. **Search Results** - Cache common search queries
4. **API Route Handlers** - Add caching to API routes if created
5. **ISR with On-Demand Revalidation** - More granular control
