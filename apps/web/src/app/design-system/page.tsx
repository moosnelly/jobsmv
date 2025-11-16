"use client";

import { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  BookmarkIcon,
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  DollarSignIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SettingsIcon,
  MenuIcon,
  HeartIcon,
  StarIcon,
  TrendingUpIcon,
  CalendarIcon,
} from "lucide-react";

export default function DesignSystemShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    option1: false,
    option2: true,
    option3: false,
  });
  const [selectedRadio, setSelectedRadio] = useState("option1");
  const [rangeValue, setRangeValue] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-app">
      {/* AppShell - Top Navigation */}
      <header className="bg-surface border-b border-subtle sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          {/* TopBar */}
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                JobsMV
              </span>
            </div>

            {/* TopNav Tabs */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <a href="#" className="px-3 py-2.5 text-primary font-medium border-b-2 border-[#0E1116] -mb-[1px]" aria-current="page">
                Jobs
              </a>
              <a href="#" className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors">
                Companies
              </a>
              <a href="#" className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors">
                Applications
              </a>
              <a href="#" className="px-3 py-2.5 text-muted font-medium hover:text-primary transition-colors">
                Saved
              </a>
            </nav>

            {/* User Area */}
            <div className="flex items-center gap-3">
              <button className="icon-button" aria-label="Notifications">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="icon-button" aria-label="User menu">
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toolbar with Filters */}
          <div className="flex items-center gap-3 py-3 overflow-x-auto">
            {/* SearchField */}
            <div className="toolbar-search flex items-center gap-2 px-4 h-10 bg-[var(--control-fill)] border border-subtle rounded-[16px] focus-within:ring-2 focus-within:ring-[#48A8FF] focus-within:ring-opacity-50">
              <SearchIcon className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="search"
                placeholder="Search jobs..."
                className="flex-1 bg-transparent text-primary placeholder:text-muted outline-none text-sm"
              />
            </div>

            {/* FilterSelect */}
            <button className="toolbar-item whitespace-nowrap">
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Location</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            <button className="toolbar-item whitespace-nowrap">
              <BriefcaseIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Job Type</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            <button className="toolbar-item whitespace-nowrap">
              <TrendingUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Experience</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {/* CounterPill */}
            <div className="flex items-center gap-2 h-10 px-3 rounded-pill bg-[var(--control-fill)] border border-subtle whitespace-nowrap">
              <span className="text-sm font-semibold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                386
              </span>
              <span className="text-xs text-muted">results</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* SidebarFilters */}
          <aside className="space-y-6">
            {/* BannerPromo */}
            <div className="rounded-card bg-[#0E1116] text-white p-6 space-y-4 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Get Your Best Profession
              </h3>
              <p className="text-sm text-[#BAC1CC]">
                Unlock premium features and stand out to employers
              </p>
              <button className="button-cta w-full">
                Upgrade Now
              </button>
            </div>

            {/* Filter Sections */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  Job Type
                </h4>
                <div className="space-y-2">
                  {["Full-time", "Part-time", "Contract", "Freelance"].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checkboxes[type.toLowerCase().replace("-", "")] || false}
                        onChange={(e) =>
                          setCheckboxes({ ...checkboxes, [type.toLowerCase().replace("-", "")]: e.target.checked })
                        }
                        className="w-[18px] h-[18px] rounded-[8px] border-2 border-[var(--border-default)] bg-[var(--control-fill)] checked:bg-[#48A8FF] checked:border-[#48A8FF] focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 cursor-pointer"
                      />
                      <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  Experience Level
                </h4>
                <div className="space-y-2">
                  {["Entry level", "Mid level", "Senior level", "Lead"].map((level) => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="experience"
                        value={level}
                        checked={selectedRadio === level}
                        onChange={() => setSelectedRadio(level)}
                        className="w-[18px] h-[18px] rounded-full border-2 border-[var(--border-default)] bg-[var(--control-fill)] checked:border-[#48A8FF] focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 cursor-pointer"
                      />
                      <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RangeSlider */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  Salary Range
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rangeValue}
                    onChange={(e) => setRangeValue(Number(e.target.value))}
                    className="w-full h-1 bg-[var(--chip-bg)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#48A8FF] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>$0/hr</span>
                    <span className="font-semibold text-primary">${rangeValue * 5}/hr</span>
                    <span>$500/hr</span>
                  </div>
                </div>
              </div>

              {/* Switch */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-primary">Remote only</span>
                  <button
                    onClick={() => setSwitchOn(!switchOn)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      switchOn ? "bg-[#48A8FF]" : "bg-[var(--chip-bg)]"
                    }`}
                    role="switch"
                    aria-checked={switchOn}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        switchOn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Section Header with SortControl */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Recommended Jobs
                </h1>
                <p className="text-secondary">Based on your profile and preferences</p>
              </div>
              <button className="toolbar-item">
                <span className="text-sm font-medium">Last updated</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>

            {/* StatCards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F3FF] flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-[#48A8FF]" />
                  </div>
                  <TrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                    1,247
                  </p>
                  <p className="text-sm text-secondary">Total Jobs</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4F6ED] flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <TrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                    342
                  </p>
                  <p className="text-sm text-secondary">Applications</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE1CC] flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <TrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                    89
                  </p>
                  <p className="text-sm text-secondary">Saved Jobs</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E3DBFA] flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <TrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                    12
                  </p>
                  <p className="text-sm text-secondary">Interviews</p>
                </div>
              </div>
            </div>

            {/* Button Showcase */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Button Variants
              </h3>
              <div className="flex flex-wrap gap-3">
                {/* Primary */}
                <button className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-[#0E1116] text-white font-semibold hover:bg-[#0B1220] transition-colors focus-ring">
                  Primary Button
                </button>

                {/* Secondary (CTA) */}
                <button className="button-cta">
                  Secondary Button
                </button>

                {/* Tertiary */}
                <button className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-transparent text-primary font-semibold border border-default hover:bg-sunken transition-colors focus-ring">
                  Tertiary Button
                </button>

                {/* Ghost */}
                <button className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-transparent text-primary font-semibold hover:bg-sunken transition-colors focus-ring">
                  Ghost Button
                </button>

                {/* Danger */}
                <button className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-[#EF4444] text-white font-semibold hover:bg-[#DC2626] transition-colors focus-ring">
                  Danger Button
                </button>

                {/* Small */}
                <button className="inline-flex items-center justify-center h-9 px-3 rounded-pill bg-[#0E1116] text-white text-sm font-semibold hover:bg-[#0B1220] transition-colors focus-ring">
                  Small Button
                </button>

                {/* Large */}
                <button className="inline-flex items-center justify-center h-11 px-5 rounded-pill bg-[#0E1116] text-white font-semibold hover:bg-[#0B1220] transition-colors focus-ring">
                  Large Button
                </button>

                {/* With Icon */}
                <button className="button-cta gap-2">
                  <StarIcon className="w-4 h-4" />
                  With Icon
                </button>

                {/* Disabled */}
                <button
                  disabled
                  className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-[var(--chip-bg)] text-muted font-semibold cursor-not-allowed opacity-50"
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* IconButton & TagChip Showcase */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Icon Buttons & Chips
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary mb-3">Icon Buttons</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="icon-button" aria-label="Bookmark">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                    <button className="icon-button" aria-label="Heart">
                      <HeartIcon className="w-4 h-4" />
                    </button>
                    <button className="icon-button" aria-label="Settings">
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                    <button className="icon-button" aria-label="Menu">
                      <MenuIcon className="w-4 h-4" />
                    </button>
                    <button className="icon-button w-9 h-9" aria-label="Large icon button">
                      <StarIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-secondary mb-3">Tag Chips</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">Full-time</span>
                    <span className="chip">Part-time</span>
                    <span className="chip">Senior level</span>
                    <span className="chip">Remote</span>
                    <span className="chip">On-site</span>
                    <span className="chip bg-[#E6F3FF]">Featured</span>
                    <span className="chip bg-[#D4F6ED] text-[#16A34A]">New</span>
                    <span className="chip bg-[#FFE1CC] text-[#F59E0B]">Hot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Components */}
            <div className="card space-y-6">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Form Inputs
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full h-10 px-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                    Email Input
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-10 px-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                    Select Dropdown
                  </label>
                  <select className="w-full h-10 px-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                    With Icon
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="number"
                      placeholder="50,000"
                      className="w-full h-10 pl-10 pr-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                    Textarea
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter your message..."
                    className="w-full px-4 py-3 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* JobCards Grid */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Job Listings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Job Card 1 - Peach */}
                <div className="job-card job-card--peach">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      20 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Google Inc.</p>
                    <h3 className="job-card__title">Senior Product Designer</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Full-time</span>
                    <span className="chip">Senior level</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $250/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">San Francisco, CA</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Job Card 2 - Mint */}
                <div className="job-card job-card--mint">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      18 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job" aria-pressed="true">
                      <BookmarkIcon className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Meta</p>
                    <h3 className="job-card__title">Frontend Engineer</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Remote</span>
                    <span className="chip">Mid level</span>
                    <span className="chip bg-[#D4F6ED] text-[#16A34A]">New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $180/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">Remote</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Job Card 3 - Lilac */}
                <div className="job-card job-card--lilac">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      15 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Apple Inc.</p>
                    <h3 className="job-card__title">UX Researcher</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Full-time</span>
                    <span className="chip">Senior level</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $220/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">Cupertino, CA</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Job Card 4 - Blue */}
                <div className="job-card job-card--blue">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      12 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Amazon</p>
                    <h3 className="job-card__title">Full Stack Developer</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Contract</span>
                    <span className="chip">Mid level</span>
                    <span className="chip bg-[#FFE1CC] text-[#F59E0B]">Hot</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $195/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">Seattle, WA</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Job Card 5 - Peach */}
                <div className="job-card job-card--peach">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      10 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Spotify</p>
                    <h3 className="job-card__title">Mobile Developer</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Remote</span>
                    <span className="chip">Entry level</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $120/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">Remote</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Job Card 6 - Mint */}
                <div className="job-card job-card--mint">
                  <div className="flex items-center justify-between">
                    <span className="job-card__meta">
                      <CalendarIcon className="w-3 h-3" />
                      8 May, 2023
                    </span>
                    <button className="icon-button" aria-label="Bookmark job">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="job-card__company">Netflix</p>
                    <h3 className="job-card__title">Data Scientist</h3>
                  </div>
                  <div className="job-card__chips">
                    <span className="chip">Full-time</span>
                    <span className="chip">Lead</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="w-4 h-4 text-muted" />
                      <span className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-numeric)" }}>
                        $280/hr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-secondary">Los Angeles, CA</span>
                    </div>
                  </div>
                  <div className="job-card__footer">
                    <button className="button-cta flex-1">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-pill bg-[var(--control-fill)] border border-subtle flex items-center justify-center text-primary hover:bg-sunken transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-pill flex items-center justify-center font-semibold transition-colors focus-ring ${
                    currentPage === page
                      ? "bg-[#0E1116] text-white"
                      : "bg-[var(--control-fill)] text-primary hover:bg-sunken"
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                disabled={currentPage === 5}
                className="w-10 h-10 rounded-pill bg-[var(--control-fill)] border border-subtle flex items-center justify-center text-primary hover:bg-sunken transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Toast/Alert Showcase */}
            <div className="card space-y-4">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Toasts & Alerts
              </h3>
              
              <button
                onClick={() => {
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="button-cta"
              >
                Show Toast Notification
              </button>

              <div className="space-y-3">
                {/* Success */}
                <div className="flex items-start gap-3 p-4 rounded-[16px] bg-surface border border-subtle shadow-md">
                  <CheckCircleIcon className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">Success!</h4>
                    <p className="text-sm text-secondary">Your application has been submitted successfully.</p>
                  </div>
                  <button className="text-muted hover:text-primary transition-colors">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 p-4 rounded-[16px] bg-surface border border-subtle shadow-md">
                  <InfoIcon className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">Information</h4>
                    <p className="text-sm text-secondary">New jobs matching your profile are available.</p>
                  </div>
                  <button className="text-muted hover:text-primary transition-colors">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-[16px] bg-surface border border-subtle shadow-md">
                  <AlertTriangleIcon className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">Warning</h4>
                    <p className="text-sm text-secondary">Please complete your profile to get better matches.</p>
                  </div>
                  <button className="text-muted hover:text-primary transition-colors">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Error */}
                <div className="flex items-start gap-3 p-4 rounded-[16px] bg-surface border border-subtle shadow-md">
                  <AlertCircleIcon className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">Error</h4>
                    <p className="text-sm text-secondary">Failed to submit application. Please try again.</p>
                  </div>
                  <button className="text-muted hover:text-primary transition-colors">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Trigger */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Modal Dialog
              </h3>
              <button onClick={() => setShowModal(true)} className="button-cta">
                Open Modal
              </button>
            </div>

            {/* Avatar Showcase */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Avatars
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-pill bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center text-white text-xs font-semibold">
                  SM
                </div>
                <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white text-sm font-semibold">
                  MD
                </div>
                <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-semibold">
                  LG
                </div>
                <div className="w-12 h-12 rounded-pill bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center text-white text-lg font-semibold">
                  XL
                </div>
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center text-white font-semibold border-2 border-white">
                    A
                  </div>
                  <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white font-semibold border-2 border-white">
                    B
                  </div>
                  <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-semibold border-2 border-white">
                    C
                  </div>
                  <div className="w-10 h-10 rounded-pill bg-[var(--chip-bg)] flex items-center justify-center text-primary text-xs font-semibold border-2 border-white">
                    +5
                  </div>
                </div>
              </div>
            </div>

            {/* EmptyState */}
            <div className="card text-center py-12">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-xl bg-[var(--chip-bg)] flex items-center justify-center mx-auto">
                  <BriefcaseIcon className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  No Jobs Found
                </h3>
                <p className="text-secondary">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button className="button-cta">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-subtle mt-12">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#48A8FF] to-[#0056B3] flex items-center justify-center">
                  <BriefcaseIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  JobsMV
                </span>
              </div>
              <p className="text-sm text-secondary">
                Find your dream job or post openings to attract top talent.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-subtle mt-8 pt-8 text-center">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} JobsMV. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface rounded-[20px] shadow-modal max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E6F3FF] flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-[#48A8FF]" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                    Confirm Application
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="icon-button"
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary">
              Are you sure you want to apply for this position? Make sure your profile is up to date before submitting.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 inline-flex items-center justify-center h-10 px-4 rounded-pill bg-transparent text-primary font-semibold border border-default hover:bg-sunken transition-colors focus-ring"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 button-cta"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="flex items-start gap-3 p-4 rounded-[16px] bg-surface border border-subtle shadow-modal min-w-[320px]">
            <CheckCircleIcon className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-primary mb-1">Success!</h4>
              <p className="text-sm text-secondary">Your changes have been saved.</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-muted hover:text-primary transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

