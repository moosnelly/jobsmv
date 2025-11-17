"use cache";

import { Suspense } from "react";
import JobDetailServer from "./JobDetailServer";

export const revalidate = 3600;
export const fetchCache = "default-cache";
export const tags = ["jobs"];
export const dynamic = "force-static";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading job...</div>
      </div>
    }>
      <JobDetailServer jobId={params.id} />
    </Suspense>
  );
}

