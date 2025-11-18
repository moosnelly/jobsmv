"use client";

import React from "react";
import { format } from "date-fns";
import {
  XIcon,
  UserIcon,
  MailIcon,
  FileTextIcon,
  CalendarIcon,
  DownloadIcon,
} from "lucide-react";
import type { Application } from "@jobsmv/types";

export interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailsModalProps) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-[var(--text-primary)] bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-[var(--bg-surface)] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-[var(--bg-surface)] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
                Application Details
              </h3>
              <button
                type="button"
                className="bg-[var(--bg-surface)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cta-solid)]"
                onClick={onClose}
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Applicant Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--cta-solid)] flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-[var(--cta-on-cta)]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[var(--text-primary)]">
                    {application.applicant_name}
                  </h4>
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <MailIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {application.applicant_email}
                  </div>
                </div>
              </div>

              {/* Application Date */}
              <div className="flex items-center text-sm text-[var(--text-secondary)]">
                <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                Applied on {format(new Date(application.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </div>

              {/* Resume */}
              {application.resume_url && (
                <div className="flex items-center space-x-2">
                  <FileTextIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--cta-solid)] hover:text-[var(--cta-solid-hover)] font-medium"
                  >
                    View Resume
                  </a>
                  <a
                    href={application.resume_url}
                    download
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-[var(--cta-solid)] hover:text-[var(--cta-solid-hover)] bg-[var(--cta-solid)] bg-opacity-10 rounded-md"
                  >
                    <DownloadIcon className="w-3 h-3 mr-1" />
                    Download
                  </a>
                </div>
              )}

              {/* Cover Letter */}
              {application.cover_letter_md && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Cover Letter
                  </h4>
                  <div className="bg-[var(--bg-sunken)] rounded-md p-4">
                    <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {application.cover_letter_md}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {application.notes && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Notes
                  </h4>
                  <div className="bg-[var(--control-fill-muted)] rounded-md p-3">
                    <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {application.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[var(--bg-sunken)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--cta-solid)] text-base font-medium text-[var(--cta-on-cta)] hover:bg-[var(--cta-solid-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cta-solid)] sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
