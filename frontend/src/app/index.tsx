import { useEffect, useState } from "react";
import { useAuth } from "@/entities/user/model";
import { userApi } from "@/entities/user/api";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { SandboxPage } from "@/pages/SandboxPage/SandboxPage";
import { ResetPasswordModal } from "@/features/auth/ResetPasswordModal/ResetPasswordModal";

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
        onDone={() => window.history.replaceState({}, "", "/")}
      />
    );
  }

  if (user && token) {
    return <SandboxPage user={user} token={token} onLogout={logout} />;
  }

  const authError =
    verifyStatus === "error" ? "Ссылка недействительна или устарела" : error;
  const authSuccess =
    verifyStatus === "done" ? "Email подтверждён! Войдите в аккаунт." : null;

  return (
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
}

export default App;
