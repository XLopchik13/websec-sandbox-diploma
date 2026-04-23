import { useEffect, useState } from "react";
import { useAuth } from "@/entities/user/model";
import { userApi } from "@/entities/user/api";
import { Router, useRouter } from "@/shared/router";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { SandboxPage } from "@/pages/SandboxPage/SandboxPage";
import type { SandboxView } from "@/pages/SandboxPage/SandboxPage";
import { NotFoundPage } from "@/pages/NotFoundPage/NotFoundPage";
import { ResetPasswordModal } from "@/features/auth/ResetPasswordModal/ResetPasswordModal";
import { createAppRoutes } from "./routes";

function readUrlTokens() {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get("reset-token");
  const verifyToken = params.get("verify-token");
  if (resetToken || verifyToken) {
    window.history.replaceState({}, "", "/");
  }
  return { resetToken, verifyToken };
}

const { resetToken: INITIAL_RESET, verifyToken: INITIAL_VERIFY } =
  readUrlTokens();

export function App() {
  const { user, token, loading, error, login, register, logout } = useAuth();
  const { pathname, replaceRoute } = useRouter();
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(
    null,
  );
  const [resetToken] = useState<string | null>(INITIAL_RESET);
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "pending" | "done" | "error"
  >(INITIAL_VERIFY ? "pending" : "idle");

  useEffect(() => {
    if (!INITIAL_VERIFY) return;
    userApi
      .verifyEmail(INITIAL_VERIFY)
      .then(() => setVerifyStatus("done"))
      .catch(() => setVerifyStatus("error"));
  }, []);

  useEffect(() => {
    if (user && token && pathname === "/") {
      replaceRoute("/dashboard");
    }
    if (!user && !token && pathname.startsWith("/dashboard")) {
      replaceRoute("/");
    }
  }, [user, token, pathname, replaceRoute]);

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
  ) => {
    const success = await register(email, username, password);
    if (success) setRegistrationEmail(email);
    return success;
  };

  if (resetToken) {
    return (
      <ResetPasswordModal token={resetToken} onDone={() => replaceRoute("/")} />
    );
  }

  const homePath = user && token ? "/dashboard" : "/";
  const authError =
    verifyStatus === "error" ? "Ссылка недействительна или устарела" : error;
  const authSuccess =
    verifyStatus === "done" ? "Email подтверждён! Войдите в аккаунт." : null;

  const renderAuthPage = () => (
    <AuthPage
      onLogin={login}
      onRegister={handleRegister}
      loading={loading}
      error={authError}
      success={authSuccess}
      registrationEmail={registrationEmail}
      onBackToLogin={() => setRegistrationEmail(null)}
    />
  );

  const renderDashboardPage = (view: SandboxView) =>
    user && token ? (
      <SandboxPage user={user} token={token} onLogout={logout} view={view} />
    ) : (
      renderAuthPage()
    );

  const routes = createAppRoutes({
    renderAuthPage,
    renderDashboardPage,
    homePath,
  });

  return (
    <Router routes={routes} fallback={<NotFoundPage homePath={homePath} />} />
  );
}

export default App;
