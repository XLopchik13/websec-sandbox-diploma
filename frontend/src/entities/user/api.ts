import { apiClient } from "@/shared/api/client";
import type { User, LoginResponse } from "./types";

export const userApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),

  register: (email: string, username: string, password: string) =>
    apiClient.post<void>("/auth/register", { email, username, password }),

  getProfile: (token: string) =>
    apiClient.get<User>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteAccount: (token: string) =>
    apiClient.delete<void>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
