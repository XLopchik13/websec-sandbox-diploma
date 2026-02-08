import { apiClient } from "@/shared/api/client";

export const sandboxApi = {
  getProgress: async (token: string) => {
    return apiClient.get<string[]>("/sandbox/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  completeLevel: async (token: string, levelId: string) => {
    return apiClient.post<{ message: string }>(
      `/sandbox/progress/${levelId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
  resetProgress: async (token: string) => {
    return apiClient.delete<{ message: string }>("/sandbox/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
