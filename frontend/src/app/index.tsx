import { useEffect, useState } from "react";
import { useAuth } from "@/entities/user/model";
import { Router, useRouter } from "@/shared/router";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { SandboxPage } from "@/pages/SandboxPage/SandboxPage";
import type { SandboxView } from "@/pages/SandboxPage/SandboxPage";
import { NotFoundPage } from "@/pages/NotFoundPage/NotFoundPage";
import { ResetPasswordModal } from "@/features/auth/ResetPasswordModal/ResetPasswordModal";
import { createAppRoutes } from "./routes";

function readResetToken() {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get("reset-token");
  if (resetToken) window.history.replaceState({}, "", "/");
  return resetToken;
}

const INITIAL_RESET = readResetToken();

export function App() {
  const { user, token, loading, error, login, register, logout } = useAuth();
  const { pathname, replaceRoute } = useRouter();
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(
    null,
  );
  const [resetToken] = useState<string | null>(INITIAL_RESET);

  useEffect(() => {
    if (
      user &&
      token &&
      (pathname === "/" || pathname === "/login" || pathname === "/register")
    ) {
      replaceRoute("/dashboard");
    }
    if (!user && !token && pathname.startsWith("/dashboard")) {
      replaceRoute("/login");
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
      <ResetPasswordModal
        token={resetToken}
        onDone={() => replaceRoute("/login")}
      />
    );
  }

  const homePath = user && token ? "/dashboard" : "/login";

  const renderAuthPage = (defaultView?: "login" | "register") => (
    <AuthPage
      onLogin={login}
      onRegister={handleRegister}
      loading={loading}
      error={error}
      registrationEmail={registrationEmail}
      onBackToLogin={() => setRegistrationEmail(null)}
      defaultView={defaultView}
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
