import { useState } from "react";
import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { LoginForm } from "@/features/auth/LoginForm/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm/RegisterForm";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./AuthPage.module.scss";

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (
    email: string,
    username: string,
    password: string,
  ) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  success?: string | null;
  registrationEmail?: string | null;
  onBackToLogin?: () => void;
}

const SIDEBAR_ITEMS = [
  {
    category: "XSS",
    items: [
      { label: "Reflected XSS", done: true },
      { label: "Stored XSS", active: true },
      { label: "DOM XSS" },
    ],
  },
  {
    category: "SQL Injection",
    items: [{ label: "Login bypass" }, { label: "UNION-based", done: true }],
  },
  { category: "IDOR", items: [{ label: "Прямой доступ" }] },
  {
    category: "Broken Auth",
    items: [{ label: "Слабые токены" }, { label: "JWT" }],
  },
];

function ServicePreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <div className={styles.previewHeaderLeft}>
          <div className={styles.previewHamburger}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.previewLogo}>WEBSEC</div>
        </div>
        <div className={styles.previewAvatar} />
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewSidebar}>
          {SIDEBAR_ITEMS.map(({ category, items }) => (
            <div key={category}>
              <div className={styles.previewCategory}>{category}</div>
              {items.map((item) => (
                <div
                  key={item.label}
                  className={`${styles.previewItem}${item.active ? ` ${styles.active}` : ""}`}
                >
                  <span
                    className={`${styles.previewDot}${item.done ? ` ${styles.done}` : ""}`}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.previewMain}>
          <div className={styles.previewHeading} />
          <div className={styles.previewText} />
          <div className={styles.previewText} />
        </div>
      </div>
    </div>
  );
}

export function AuthPage({
  onLogin,
  onRegister,
  loading,
  error,
  success,
  registrationEmail,
  onBackToLogin,
}: AuthPageProps) {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className={styles.page}>
      <ServicePreview />
      <div className={styles.overlay} />

      <div className={styles.card}>
        {registrationEmail ? (
          <LauncherWindow title="Проверьте почту">
            <p className={styles.notice}>
              Письмо с подтверждением отправлено на{" "}
              <strong>{registrationEmail}</strong>.
            </p>
            <p className={styles.notice}>
              Перейдите по ссылке в письме, чтобы активировать аккаунт.
            </p>
            <Button
              variant="link"
              onClick={onBackToLogin}
              className={styles.backLink}
            >
              Вернуться ко входу
            </Button>
          </LauncherWindow>
        ) : (
          <LauncherWindow
            title={view === "login" ? "Вход" : "Регистрация"}
            error={error}
            success={success}
          >
            {view === "login" ? (
              <LoginForm
                onSubmit={onLogin}
                onSwitchToRegister={() => setView("register")}
                disabled={loading}
              />
            ) : (
              <RegisterForm
                onSubmit={onRegister}
                onSwitchToLogin={() => setView("login")}
                disabled={loading}
              />
            )}
          </LauncherWindow>
        )}
      </div>
    </div>
  );
}
