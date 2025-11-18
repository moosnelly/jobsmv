import Link from "next/link";
import type { JobPublic } from "@jobsmv/types";
import { getPublicJobServer } from "@/lib/server-api";

function formatSalary(job: JobPublic): string {
  if (job.salary_hidden) {
    return "Salary: Negotiable";
  }

  if (!job.salaries || job.salaries.length === 0) {
    return "";
  }

  const salaryStrings = job.salaries.map(salary => {
    const currency = salary.currency;
    const min = salary.amountMin;
    const max = salary.amountMax;

    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`;
    }
    return "";
  }).filter(s => s.length > 0);

  if (salaryStrings.length === 0) {
    return "";
  }

  return `Salary: ${salaryStrings.join(" • ")}`;
}

export default async function JobDetailServer({ jobId }: { jobId: string }) {
  try {
    const job = await getPublicJobServer(jobId);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/jobs"
            className="text-primary-600 hover:underline mb-4 inline-block"
          >
            ← Back to jobs
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.location && (
                <p className="text-gray-600">{job.location}</p>
              )}
              {(() => {
                const salaryText = formatSalary(job);
                return salaryText ? (
                  <p className="text-lg font-medium text-primary-600 mt-2">
                    {salaryText}
                  </p>
                ) : null;
              })()}
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description_md }}
              />
            </div>

            {job.requirements_md && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.requirements_md }}
                />
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href={`/apply/${job.id}`}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load job:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
          <Link href="/jobs" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }
}
