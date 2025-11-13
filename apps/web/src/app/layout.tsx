import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobSMV - Job Listing Platform",
  description: "Find your next opportunity or post a job",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

