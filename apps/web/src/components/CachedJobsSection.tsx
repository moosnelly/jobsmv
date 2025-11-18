import Link from "next/link";
import { JobCard } from "@jobsmv/ui-tripled";
import { getPublicJobsServer } from "@/lib/server-api";

const accentColors = ["peach", "mint", "lilac", "blue"] as const;

export async function CachedJobsSection() {
  try {
    const jobsData = await getPublicJobsServer();
    const jobs = jobsData.items || [];

    if (jobs.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-muted">No jobs found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.slice(0, 9).map((job, index) => {
          const accentColor = accentColors[index % accentColors.length] as "peach" | "mint" | "lilac" | "blue";
          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className="focus-ring">
              <JobCard 
                job={job} 
                accentColor={accentColor}
                className="hover:scale-[1.02] transition-transform"
              />
            </Link>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("Failed to load jobs:", error);
    return (
      <div className="text-center py-20">
        <p className="text-muted">Failed to load jobs. Please try again later.</p>
      </div>
    );
  }
}
