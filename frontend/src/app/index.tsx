import { useEffect, useState } from "react";
import { useAuth } from "@/entities/user/model";
import { userApi } from "@/entities/user/api";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { SandboxPage } from "@/pages/SandboxPage/SandboxPage";
import { ResetPasswordModal } from "@/features/auth/ResetPasswordModal/ResetPasswordModal";

export function App() {
  const { user, token, loading, error, login, register, logout } = useAuth();
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(
    null,
  );
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "pending" | "done" | "error"
  >("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rt = params.get("reset-token");
    const vt = params.get("verify-token");

    if (rt) {
      setResetToken(rt);
      window.history.replaceState({}, "", "/");
    }

    if (vt) {
      setVerifyStatus("pending");
      window.history.replaceState({}, "", "/");
      userApi
        .verifyEmail(vt)
        .then(() => setVerifyStatus("done"))
        .catch(() => setVerifyStatus("error"));
    }
  }, []);

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
  ) => {
    const success = await register(email, username, password);
    if (success) {
      setRegistrationEmail(email);
    }
    return success;
  };

  const handleResetDone = () => {
    setResetToken(null);
  };

  if (resetToken) {
    return <ResetPasswordModal token={resetToken} onDone={handleResetDone} />;
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
