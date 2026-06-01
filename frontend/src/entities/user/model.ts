import { useState, useEffect, useCallback } from "react";
import { userApi } from "./api";
import type { User } from "./types";

interface RegisterResult {
  success: boolean;
  needsVerification: boolean;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await userApi.getProfile(token);
      setUser(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        logout();
      }
      console.error("Profile fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await userApi.login(email, password);
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ): Promise<RegisterResult> => {
    setError(null);
    setLoading(true);
    try {
      const created = await userApi.register(email, username, password);
      return { success: true, needsVerification: !created.is_verified };
    } catch (err) {
      if (err instanceof Error && err.message === "email_not_verified") {
        return { success: true, needsVerification: true };
      }
      setError(err instanceof Error ? err.message : "Registration failed");
      return { success: false, needsVerification: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!token || !confirm("Are you sure? This cannot be undone.")) return;

    setLoading(true);
    try {
      await userApi.deleteAccount(token);
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    deleteAccount,
  };
}
