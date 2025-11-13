"use client";

import React, { useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FiltersPanelProps {
  categories?: FilterOption[];
  locations?: FilterOption[];
  onFilterChange?: (filters: {
    category?: string;
    location?: string;
    search?: string;
  }) => void;
  className?: string;
}

export function FiltersPanel({
  categories = [],
  locations = [],
  onFilterChange,
  className = "",
}: FiltersPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleFilterChange = (
    type: "search" | "category" | "location",
    value: string
  ) => {
    if (type === "search") {
      setSearch(value);
    } else if (type === "category") {
      setSelectedCategory(value);
    } else if (type === "location") {
      setSelectedLocation(value);
    }

    onFilterChange?.({
      search: type === "search" ? value : search,
      category: type === "category" ? value : selectedCategory,
      location: type === "location" ? value : selectedLocation,
    });
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search jobs..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        {categories.length > 0 && (
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {locations.length > 0 && (
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

