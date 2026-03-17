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
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
  deleteComments: async (token: string, levelId: string) => {
    return apiClient.delete<{ message: string }>(
      `/sandbox/levels/${levelId}/comments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
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
};
