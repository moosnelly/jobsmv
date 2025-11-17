"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MapPinIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { apiClient, type AtollLocation } from "@/lib/api-client";

type LocationDropdownProps = {
  selectedLocation: string | null;
  onChange: (value: string | null) => void;
};

export default function LocationDropdown({ selectedLocation, onChange }: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<AtollLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && isOpen && locations.length === 0) {
      setLoading(true);
      apiClient
        .getLocations()
        .then(setLocations)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [hasMounted, isOpen, locations.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;

    const query = searchQuery.toLowerCase();
    return locations
      .map((location) => ({
        ...location,
        islands: location.islands.filter((island) =>
          island.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (location) =>
          location.atoll.toLowerCase().includes(query) ||
          location.islands.length > 0
      );
  }, [locations, searchQuery]);

  const handleLocationSelect = (value: string | null) => {
    onChange(value);
    setIsOpen(false);
    setSearchQuery("");
  };

  const getDisplayLabel = () => {
    if (!selectedLocation) return "All Locations";
    return selectedLocation;
  };

  const renderLocationOption = (atoll: string, island?: string) => {
    const value = island ? `${atoll}, ${island}` : atoll;
    const isSelected = selectedLocation === value;

    return (
      <button
        key={value}
        onClick={() => handleLocationSelect(value)}
        className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--dark-header-control-hover)] transition-colors ${
          isSelected ? "bg-[var(--dark-header-control-hover)] text-[var(--cta-solid)]" : "text-[var(--dark-header-text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {island ? (
              <>
                <span className="font-medium">{atoll}</span>
                <span className="text-[var(--dark-header-text-muted)]">, {island}</span>
              </>
            ) : (
              <span className="font-medium">{atoll}</span>
            )}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dark-header-text-muted)] hover:text-[var(--dark-header-text)] transition-colors focus-ring"
        aria-label="Select location"
        aria-expanded={isOpen}
      >
        <MapPinIcon className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{getDisplayLabel()}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--dark-header-bg)] border border-[var(--dark-header-border)] rounded-card shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-[var(--dark-header-border)]">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-header-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search atolls or islands..."
                className="w-full h-10 pl-10 pr-3 rounded-[8px] bg-[var(--control-fill)] border border-[var(--dark-header-border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none text-sm focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50"
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-[var(--dark-header-text-muted)] text-sm">Loading locations...</div>
              </div>
            ) : (
              <>
                {/* All Locations Option */}
                <div className="py-1">
                  <button
                    onClick={() => handleLocationSelect(null)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--dark-header-control-hover)] transition-colors ${
                      !selectedLocation ? "bg-[var(--dark-header-control-hover)] text-[var(--cta-solid)]" : "text-[var(--dark-header-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">All Locations</span>
                    </div>
                  </button>
                </div>

                <div className="border-t border-[var(--dark-header-border)]"></div>

                {/* Location Options */}
                <div className="py-1">
                  {filteredLocations.length === 0 ? (
                    <div className="px-4 py-3 text-[var(--dark-header-text-muted)] text-sm">
                      No locations found
                    </div>
                  ) : (
                    filteredLocations.map((location) => (
                      <div key={location.atoll}>
                        {/* Atoll Header */}
                        <div className="px-4 py-2 bg-[var(--dark-header-control-bg)] border-b border-[var(--dark-header-border)]">
                          <div className="text-xs font-semibold text-[var(--dark-header-text-muted)] uppercase tracking-wide">
                            {location.atoll}
                          </div>
                        </div>

                        {/* Atoll Selection */}
                        {renderLocationOption(location.atoll)}

                        {/* Islands */}
                        {location.islands.map((island) =>
                          renderLocationOption(location.atoll, island)
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
