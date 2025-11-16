"use client";

import { apiClient } from "./api-client";

export function useAuth() {
  const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  };

  const login = async (email: string, password: string) => {
    return apiClient.login(email, password);
  };

  const register = async (data: {
    company_name: string;
    email: string;
    password: string;
    contact_info?: Record<string, unknown>;
  }) => {
    return apiClient.register(data);
  };

  const logout = () => {
    apiClient.logout();
    window.location.href = "/";
  };

  return {
    isAuthenticated,
    login,
    register,
    logout,
  };
}

