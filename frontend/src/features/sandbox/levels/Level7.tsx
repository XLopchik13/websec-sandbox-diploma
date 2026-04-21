import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level7.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

const NAVBAR = [
  { label: "Дашборд", active: true },
  { label: "Серверы" },
  { label: "Алерты" },
  { label: "Настройки" },
];

export function Level7({ onSuccess }: LevelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const token = localStorage.getItem("token")!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await sandboxApi.misconfigLogin(token, username, password);
      if (data.success && data.role === "admin") {
        setLoggedIn(true);
        setSecret(data.secret ?? null);
        onSuccess();
      } else if (data.success) {
        setLoggedIn(true);
      } else {
        setError(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow
          url="monitor.corp-internal.io/dashboard"
          appName="OpsWatch"
          appColor="#0369a1"
          navbar={NAVBAR}
        >
          {!loggedIn ? (
            <div
              style={{
                background: "#0f172a",
                minHeight: "420px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className={styles.loginCard}>
                <div className={styles.loginLogo}>
                  <span style={{ fontSize: "28px" }}>🖥</span>
                </div>
                <div className={styles.loginTitle}>OpsWatch Monitor</div>
                <div className={styles.loginVersion}>
                  v2.3.1 — Infrastructure Dashboard
                </div>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                  <input
                    className={styles.loginInput}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                  <input
                    className={styles.loginInput}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <div className={styles.loginError}>{error}</div>}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={styles.loginBtn}
                  >
                    {loading ? "..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#0f172a",
                minHeight: "420px",
                padding: "24px",
                color: "#e2e8f0",
              }}
            >
              <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                  <span className={styles.dashboardBadge}>
                    ✓ Authenticated as admin
                  </span>
                </div>
                <div className={styles.statsGrid}>
                  {[
                    { label: "Servers Online", value: "42", color: "#22c55e" },
                    { label: "Active Alerts", value: "3", color: "#f59e0b" },
                    { label: "CPU Avg", value: "23%", color: "#3b82f6" },
                    { label: "Memory Avg", value: "61%", color: "#8b5cf6" },
                  ].map((s) => (
                    <div key={s.label} className={styles.statCard}>
                      <div
                        className={styles.statValue}
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </div>
                      <div className={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {secret && (
                  <div className={styles.secretBox}>
                    <span style={{ color: "#fbbf24" }}>🔑 Admin secret:</span>{" "}
                    <code>{secret}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </BrowserWindow>
      </div>
    </div>
  );
}
