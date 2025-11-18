import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileSettingsPanel from "../ProfileSettingsPanel";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

vi.mock("@/lib/api-client");
vi.mock("@/lib/auth");

describe("ProfileSettingsPanel", () => {
  const mockOnClose = vi.fn();
  const mockEmployer = {
    id: "1",
    company_name: "Test Company",
    email: "test@example.com",
    contact_info: {
      phone: "+1234567890",
      website: "https://example.com",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      isAuthenticated: () => true,
    });
  });

  it("should render panel when isOpen is true", async () => {
    (apiClient.getCurrentEmployer as any).mockResolvedValue(mockEmployer);

    render(
      <ProfileSettingsPanel isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-settings-panel")).toBeInTheDocument();
    });

    expect(screen.getByText("Profile Settings")).toBeInTheDocument();
  });

  it("should not render panel content when isOpen is false", () => {
    render(
      <ProfileSettingsPanel isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByTestId("profile-settings-panel")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    (apiClient.getCurrentEmployer as any).mockResolvedValue(mockEmployer);

    render(
      <ProfileSettingsPanel isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Close panel")).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText("Close panel");
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should call onClose when backdrop is clicked", async () => {
    (apiClient.getCurrentEmployer as any).mockResolvedValue(mockEmployer);

    render(
      <ProfileSettingsPanel isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-settings-panel")).toBeInTheDocument();
    });

    const backdrop = document.querySelector(".bg-black\\/50");
    expect(backdrop).toBeInTheDocument();
    
    if (backdrop) {
      await userEvent.click(backdrop as HTMLElement);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should display loading state", async () => {
    (apiClient.getCurrentEmployer as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <ProfileSettingsPanel isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });
  });

  it("should display error state", async () => {
    (apiClient.getCurrentEmployer as any).mockRejectedValue(
      new Error("Failed to load")
    );

    render(
      <ProfileSettingsPanel isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load profile data")).toBeInTheDocument();
    });
  });
});
