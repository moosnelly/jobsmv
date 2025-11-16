"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AlertCircleIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard/jobs");
    } catch (err: any) {
      setError(err.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center py-12 px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card space-y-6">
          <div className="text-center">
            <h1
              className="text-3xl font-bold text-primary mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sign in to your account
            </h1>
            <p className="text-secondary">
              Or{" "}
              <Link
                href="/register"
                className="text-cta-solid hover:text-cta-solid-hover font-medium transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA]">
                <AlertCircleIcon className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 px-4 rounded-[16px] bg-[var(--control-fill)] border border-subtle text-primary placeholder:text-muted focus:ring-2 focus:ring-[#48A8FF] focus:ring-opacity-50 outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button-cta w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

