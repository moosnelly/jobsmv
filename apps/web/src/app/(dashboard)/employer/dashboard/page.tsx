"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to overview as the default dashboard page
    router.replace("/employer/dashboard/overview");
  }, [router]);

  return null;
}
