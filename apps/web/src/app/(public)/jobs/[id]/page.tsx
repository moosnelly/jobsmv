import { Suspense } from "react";
import JobDetailServer from "./JobDetailServer";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
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

// Note: JobDetailServer has its own error handling, so we don't need additional try/catch here

