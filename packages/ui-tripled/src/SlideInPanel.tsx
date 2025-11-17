"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: 0 }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-lg border-l border-gray-200 ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "slide-panel-title" : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-subtle">
                {title && (
                  <h2
                    id="slide-panel-title"
                    className="text-xl font-bold text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h2>
                )}
                <button
                  onClick={onClose}
                  className="icon-button flex-shrink-0 ml-4"
                  aria-label="Close panel"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
