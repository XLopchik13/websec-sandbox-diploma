import { useState, useEffect } from "react";
import { LauncherWindow } from "./components/layout/LauncherWindow/LauncherWindow";
import { LoginForm } from "./features/auth/LoginForm/LoginForm";
import { RegisterForm } from "./features/auth/RegisterForm/RegisterForm";
import { UserProfile } from "./features/user/UserProfile/UserProfile";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [view, setView] = useState<"login" | "register" | "profile">("login");
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setView("profile");
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
      } else {
        setError(data.detail || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful. Please login.");
        setView("login");
      } else {
        setError(data.detail || "Registration failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        logout();
      } else {
        setError("Failed to delete account");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setView("login");
    setError(null);
  };

  if (view === "profile" && user) {
    return (
      <LauncherWindow title="User Profile" error={error}>
        <UserProfile
          user={user}
          onLogout={logout}
          onDeleteAccount={deleteAccount}
        />
      </LauncherWindow>
    );
  }

  return (
    <LauncherWindow
      title={view === "login" ? "Login" : "Register"}
      error={error}
    >
      {view === "login" ? (
        <LoginForm
          onSubmit={login}
          onSwitchToRegister={() => setView("register")}
          disabled={loading}
        />
      ) : (
        <RegisterForm
          onSubmit={register}
          onSwitchToLogin={() => setView("login")}
          disabled={loading}
        />
      )}
    </LauncherWindow>
  );
}

export default App;
