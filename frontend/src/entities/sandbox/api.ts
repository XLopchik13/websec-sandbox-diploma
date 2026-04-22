import { apiClient } from "@/shared/api/client";

import type { LevelMeta } from "./types";

export const sandboxApi = {
  getLevels: async (token: string) => {
    return apiClient.get<LevelMeta[]>("/sandbox/levels", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getProgress: async (token: string) => {
    return apiClient.get<{ completed: string[]; total: number }>(
      "/sandbox/progress",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
  completeLevel: async (token: string, levelId: string) => {
    return apiClient.post<{ completed: string[]; total: number }>(
      `/sandbox/progress/${levelId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  uncompleteLevel: async (token: string, levelId: string) => {
    return apiClient.delete<void>(`/sandbox/progress/${levelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  resetProgress: async (token: string) => {
    return apiClient.delete<void>("/sandbox/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Level 1 — XSS
  createComment: async (token: string, levelId: string, content: string) => {
    return apiClient.post<{
      id: number;
      user_id: number;
      level_id: string;
      content: string;
      created_at: string;
    }>(
      `/sandbox/levels/${levelId}/comments`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  deleteComments: async (token: string, levelId: string) => {
    return apiClient.delete<{ message: string }>(
      `/sandbox/levels/${levelId}/comments`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  getComments: async (token: string, levelId: string) => {
    return apiClient.get<
      Array<{
        id: number;
        user_id: number;
        level_id: string;
        content: string;
        created_at: string;
      }>
    >(`/sandbox/levels/${levelId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Level 2 — SQL Injection
  sqliSearch: async (token: string, username: string) => {
    return apiClient.get<Array<{ id: number; username: string; role: string }>>(
      `/sandbox/levels/2/search?username=${encodeURIComponent(username)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  sqliReset: async (token: string) => {
    return apiClient.post<{ message: string }>(
      "/sandbox/levels/2/reset",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 3 — IDOR
  idorMyProfile: async (token: string) => {
    return apiClient.get<{
      id: number;
      username: string;
      email: string;
      phone: string;
      role: string;
      secret_note: string;
    }>("/sandbox/levels/3/my-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  idorGetProfile: async (token: string, profileId: number) => {
    return apiClient.get<{
      id: number;
      username: string;
      email: string;
      phone: string;
      role: string;
      secret_note: string;
    }>(`/sandbox/levels/3/profile/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  idorReset: async (token: string) => {
    return apiClient.post<{ message: string }>(
      "/sandbox/levels/3/reset",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 4 — Broken Auth (JWT)
  jwtGetToken: async (token: string) => {
    return apiClient.get<{ token: string }>("/sandbox/levels/4/token", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  jwtVerify: async (token: string, sandboxToken: string) => {
    return apiClient.post<{
      access: string;
      role: string;
      message: string;
      secret: string;
    }>(
      "/sandbox/levels/4/verify",
      { token: sandboxToken },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 5 — SSRF
  ssrfFetch: async (token: string, url: string) => {
    return apiClient.post<{
      status: number;
      content: string;
      secret: string | null;
    }>(
      "/sandbox/levels/5/fetch",
      { url },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 6 — Path Traversal
  pathTraversalRead: async (token: string, name: string) => {
    return apiClient.get<{
      found: boolean;
      content: string | null;
      traversal: boolean;
    }>(`/sandbox/levels/6/file?name=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Level 7 — Security Misconfiguration
  misconfigLogin: async (token: string, username: string, password: string) => {
    return apiClient.post<{
      success: boolean;
      role: string | null;
      message: string;
      secret: string | null;
    }>(
      "/sandbox/levels/7/login",
      { username, password },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 8 — Cryptographic Failures
  cryptoGetUsers: async (token: string) => {
    return apiClient.get<
      Array<{ id: number; username: string; password_hash: string }>
    >("/sandbox/levels/8/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  cryptoLogin: async (token: string, username: string, password: string) => {
    return apiClient.post<{
      success: boolean;
      role: string | null;
      message: string;
    }>(
      "/sandbox/levels/8/login",
      { username, password },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 9 — Command Injection
  cmdiPing: async (token: string, host: string) => {
    return apiClient.get<{ output: string; injected: boolean }>(
      `/sandbox/levels/9/ping?host=${encodeURIComponent(host)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 10 — CSRF
  csrfGetAccount: async (token: string) => {
    return apiClient.get<{
      balance: number;
      last_transfer_to: string | null;
      last_transfer_amount: number | null;
    }>("/sandbox/levels/10/account", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  csrfTransfer: async (token: string, amount: number, to: string) => {
    return apiClient.post<{
      success: boolean;
      balance: number;
      message: string;
    }>(
      "/sandbox/levels/10/transfer",
      { amount, to },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  csrfReset: async (token: string) => {
    return apiClient.post<void>(
      "/sandbox/levels/10/reset",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  // Level 11 — Supply Chain
  supplyChainPackages: async (token: string) => {
    return apiClient.get<
      Array<{
        name: string;
        version: string;
        downloads: string;
        description: string;
        author: string;
        published: string;
        verified: boolean;
        postinstall: string | null;
      }>
    >("/sandbox/levels/11/packages", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  supplyChainInstall: async (token: string, package_name: string) => {
    return apiClient.post<{
      output: string;
      malicious: boolean;
      success: boolean;
    }>(
      "/sandbox/levels/11/install",
      { package_name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
};
