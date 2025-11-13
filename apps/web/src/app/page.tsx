"use client";

import Link from "next/link";
import {
  SearchIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  BuildingIcon,
  GraduationCapIcon,
  HeartIcon,
  ZapIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to jobs page with search params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-app">
      {/* Navigation */}
      <header className="bg-surface border-b border-subtle sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-xl font-bold text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LuckyJob
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <Link
                href="/jobs"
                className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/jobs"
                className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors"
              >
                Companies
              </Link>
              <Link
                href="/login"
                className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors"
              >
                For Employers
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-pill bg-transparent text-primary font-semibold hover:bg-sunken transition-colors focus-ring"
              >
                Sign In
              </Link>
              <Link href="/register" className="button-cta">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1116] to-[#1a2332] text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#48A8FF] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e3dbfa] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <StarIcon className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
              <span className="text-sm font-semibold">Trusted by 10,000+ job seekers</span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find Your Dream Job{" "}
              <span className="text-[#48A8FF]">Today</span>
            </h1>

            <p className="text-xl text-[#BAC1CC] mb-10 leading-relaxed">
              Discover thousands of opportunities from top companies. Your next career move starts here.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-[20px] p-2 shadow-xl max-w-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-[#F8FAFC] rounded-[16px]">
                  <SearchIcon className="w-5 h-5 text-[#667085] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Job title, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-[#0E1116] placeholder:text-[#667085] outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-[#F8FAFC] rounded-[16px]">
                  <MapPinIcon className="w-5 h-5 text-[#667085] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-transparent text-[#0E1116] placeholder:text-[#667085] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-[52px] px-8 rounded-[16px] bg-[#48A8FF] text-white font-bold hover:bg-[#0056B3] transition-colors shadow-lg"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#BAC1CC]">Popular:</span>
              {["UI Designer", "Frontend Developer", "Product Manager", "Data Analyst"].map(
                (tag) => (
                  <Link
                    key={tag}
                    href={`/jobs?q=${encodeURIComponent(tag)}`}
                    className="chip !bg-white/10 !text-white hover:!bg-white/20 transition-colors"
                  >
                    {tag}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/10">
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-numeric)" }}
              >
                10K+
              </div>
              <div className="text-[#BAC1CC]">Active Jobs</div>
            </div>
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-numeric)" }}
              >
                5K+
              </div>
              <div className="text-[#BAC1CC]">Companies</div>
            </div>
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-numeric)" }}
              >
                50K+
              </div>
              <div className="text-[#BAC1CC]">Job Seekers</div>
            </div>
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-numeric)" }}
              >
                95%
              </div>
              <div className="text-[#BAC1CC]">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Browse by Category
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Explore opportunities across various industries and find the perfect match for your skills
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Technology",
              count: 2847,
              icon: <BriefcaseIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-4)",
            },
            {
              name: "Design",
              count: 1523,
              icon: <StarIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-3)",
            },
            {
              name: "Marketing",
              count: 1891,
              icon: <TrendingUpIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-1)",
            },
            {
              name: "Finance",
              count: 743,
              icon: <BuildingIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-2)",
            },
            {
              name: "Healthcare",
              count: 921,
              icon: <HeartIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-1)",
            },
            {
              name: "Education",
              count: 654,
              icon: <GraduationCapIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-4)",
            },
            {
              name: "Sales",
              count: 1234,
              icon: <UsersIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-2)",
            },
            {
              name: "Engineering",
              count: 2156,
              icon: <ZapIcon className="w-6 h-6" />,
              color: "var(--color-accent-card-3)",
            },
          ].map((category, index) => (
            <Link
              key={category.name}
              href={`/jobs?category=${encodeURIComponent(category.name)}`}
              className="card hover:shadow-lg transition-all duration-300 group cursor-pointer"
              style={{ backgroundColor: category.color }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-[#0E1116] group-hover:scale-110 transition-transform"
                >
                  {category.icon}
                </div>
                <ArrowRightIcon className="w-5 h-5 text-[#0E1116] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3
                className="text-xl font-semibold text-primary mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {category.name}
              </h3>
              <p className="text-sm text-secondary">
                <span
                  className="font-semibold text-primary"
                  style={{ fontFamily: "var(--font-numeric)" }}
                >
                  {category.count.toLocaleString()}
                </span>{" "}
                open positions
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-sunken py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-primary mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Get started in three simple steps and land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description:
                  "Sign up and build your professional profile with your skills, experience, and career goals.",
                icon: <UsersIcon className="w-6 h-6 text-white" />,
              },
              {
                step: "2",
                title: "Find Perfect Jobs",
                description:
                  "Browse thousands of opportunities and get personalized recommendations based on your profile.",
                icon: <SearchIcon className="w-6 h-6 text-white" />,
              },
              {
                step: "3",
                title: "Apply & Get Hired",
                description:
                  "Apply with one click and track your applications. Connect directly with employers.",
                icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
              },
            ].map((step) => (
              <div key={step.step} className="card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] mb-6">
                  {step.icon}
                </div>
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--chip-bg)] text-primary font-bold mb-4"
                  style={{ fontFamily: "var(--font-numeric)" }}
                >
                  {step.step}
                </div>
                <h3
                  className="text-2xl font-semibold text-primary mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-secondary leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-4xl font-bold text-primary mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why Job Seekers Love LuckyJob
            </h2>
            <p className="text-lg text-secondary mb-8">
              We're not just another job board. We're your partner in career success.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <ZapIcon className="w-5 h-5 text-[#48A8FF]" />,
                  title: "Lightning Fast Applications",
                  description: "Apply to jobs with one click using your saved profile",
                },
                {
                  icon: <ShieldCheckIcon className="w-5 h-5 text-[#16A34A]" />,
                  title: "Verified Companies Only",
                  description: "All employers are verified to ensure legitimate opportunities",
                },
                {
                  icon: <TrendingUpIcon className="w-5 h-5 text-[#F59E0B]" />,
                  title: "Smart Recommendations",
                  description: "Get personalized job matches based on your skills and preferences",
                },
                {
                  icon: <HeartIcon className="w-5 h-5 text-[#EF4444]" />,
                  title: "Save Your Favorites",
                  description: "Bookmark jobs and get alerts when similar positions open up",
                },
              ].map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface border border-subtle flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="card p-8 bg-gradient-to-br from-[#e3dbfa] to-[#fbe2f4]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center">
                    <StarIcon className="w-7 h-7 text-[#FFD700] fill-[#FFD700]" />
                  </div>
                  <div>
                    <div
                      className="text-3xl font-bold text-primary"
                      style={{ fontFamily: "var(--font-numeric)" }}
                    >
                      4.9/5
                    </div>
                    <div className="text-sm text-secondary">Average rating</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-[16px] p-5 shadow-sm">
                    <p className="text-primary mb-3 leading-relaxed">
                      "LuckyJob helped me land my dream job in just 2 weeks! The platform is so easy to use."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48A8FF] to-[#0056B3]" />
                      <div>
                        <div className="text-sm font-semibold text-primary">Sarah Johnson</div>
                        <div className="text-xs text-muted">Product Designer</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[16px] p-5 shadow-sm">
                    <p className="text-primary mb-3 leading-relaxed">
                      "The best job platform I've used. Great companies and super responsive support team!"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16A34A] to-[#10B981]" />
                      <div>
                        <div className="text-sm font-semibold text-primary">Michael Chen</div>
                        <div className="text-xs text-muted">Software Engineer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#48A8FF] to-[#0056B3] text-white py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-[#e3dbfa] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
          <h2
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream jobs through LuckyJob
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-pill bg-white text-[#48A8FF] font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-pill bg-transparent text-white font-bold border-2 border-white hover:bg-white/10 transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E1116] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  LuckyJob
                </span>
              </div>
              <p className="text-[#BAC1CC] text-sm leading-relaxed">
                Your trusted partner in finding the perfect career opportunity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-[#BAC1CC]">
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Job Alerts
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-[#BAC1CC]">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Employer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#BAC1CC]">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-[#BAC1CC]">
            <p>© 2024 LuckyJob. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
