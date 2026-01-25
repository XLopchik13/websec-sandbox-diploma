import { useState } from "react";
import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { LoginForm } from "@/features/auth/LoginForm/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm/RegisterForm";

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, username: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export function AuthPage({
  onLogin,
  onRegister,
  loading,
  error,
}: AuthPageProps) {
  const [view, setView] = useState<"login" | "register">("login");

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
  ) => {
    onRegister(email, username, password);
  };

  return (
    <LauncherWindow
      title={view === "login" ? "Login" : "Register"}
      error={error}
    >
      {view === "login" ? (
        <LoginForm
          onSubmit={onLogin}
          onSwitchToRegister={() => setView("register")}
          disabled={loading}
        />
      ) : (
        <RegisterForm
          onSubmit={handleRegister}
          onSwitchToLogin={() => setView("login")}
          disabled={loading}
        />
      )}
    </LauncherWindow>
  );
}
