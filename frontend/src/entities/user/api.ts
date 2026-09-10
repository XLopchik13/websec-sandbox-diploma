import { apiClient } from "@/shared/api/client";
import type { User, LoginResponse } from "./types";

export const userApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),

  register: (email: string, username: string, password: string) =>
    apiClient.post<User>("/auth/register", { email, username, password }),

  getProfile: (token: string) =>
    apiClient.get<User>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteAccount: (token: string) =>
    apiClient.delete<void>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>("/auth/verify-email", { token }),

  requestPasswordReset: (email: string) =>
    apiClient.post<{ message: string }>("/auth/request-password-reset", {
      email,
    }),

  resetPassword: (token: string, new_password: string) =>
    apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      new_password,
    }),
};
