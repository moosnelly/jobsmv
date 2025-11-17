"use client";

import React, { useEffect } from "react";

export interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SlideInPanel({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: SlideInPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-panel-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div
          className={`relative w-screen max-w-md transform transition-transform duration-300 ease-out ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col bg-surface shadow-modal border-l border-subtle">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-subtle bg-surface px-6 py-5">
              {title && (
                <h2
                  className="text-xl font-bold text-primary"
                  style={{ fontFamily: "var(--font-display)" }}
                  id="slide-panel-title"
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="icon-button ml-auto flex-shrink-0"
                aria-label="Close panel"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
