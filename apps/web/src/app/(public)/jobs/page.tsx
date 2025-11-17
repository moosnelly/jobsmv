import { Suspense } from "react";
import JobsPageClient from "./JobsPageClient";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-primary">Loading jobs...</div>
    </div>}>
      <JobsPageClient />
    </Suspense>
  );
}

