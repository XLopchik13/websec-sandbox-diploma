import { useState, useEffect } from "react";
import { userApi } from "./api";
import type { User } from "./types";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await userApi.getProfile(token);
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

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

  const register = async (email: string, username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await userApi.register(email, username, password);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      return false;
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

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
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
