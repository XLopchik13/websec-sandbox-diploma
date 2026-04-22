import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level8.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

interface CryptoUser {
  id: number;
  username: string;
  password_hash: string;
}

const NAVBAR = [
  { label: "Главная" },
  { label: "Пользователи", active: true },
  { label: "Роли" },
  { label: "Журнал" },
];

export function Level8({ onSuccess }: LevelProps) {
  const [users, setUsers] = useState<CryptoUser[]>([]);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginResult, setLoginResult] = useState<{
    success: boolean;
    role: string | null;
    message: string;
  } | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const token = localStorage.getItem("token")!;

  useEffect(() => {
    sandboxApi.cryptoGetUsers(token).then(setUsers).catch(console.error);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginResult(null);
    try {
      const data = await sandboxApi.cryptoLogin(token, loginUser, loginPass);
      setLoginResult(data);
      if (data.success && data.role === "admin") onSuccess();
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow
          url="directory.corp-internal.io/users"
          appName="CorpDirectory"
          appColor="#7c3aed"
          navbar={NAVBAR}
        >
          <div
            style={{
              background: "#f8fafc",
              minHeight: "420px",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                Каталог пользователей
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Хранилище учётных данных — внутренний доступ
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "24px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {["ID", "Username", "Password Hash", "Algorithm"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 16px",
                            color: "#64748b",
                            fontWeight: "600",
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>
                        {u.id}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          color: "#0f172a",
                          fontWeight: "500",
                        }}
                      >
                        {u.username}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <code className={styles.hashCode}>
                          {u.password_hash}
                        </code>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span className={styles.algBadge}>MD5</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginBottom: "12px",
                }}
              >
                Проверка доступа
              </div>
              <form
                onSubmit={handleLogin}
                style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <input
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Username"
                    className={styles.input}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Password"
                    className={styles.input}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loginLoading || !loginUser || !loginPass}
                  className={styles.loginBtn}
                >
                  {loginLoading ? "..." : "Войти"}
                </Button>
              </form>
              {loginResult && (
                <div
                  className={
                    loginResult.success ? styles.successMsg : styles.errorMsg
                  }
                >
                  {loginResult.message}
                  {loginResult.success && loginResult.role && (
                    <span className={styles.roleBadge}>{loginResult.role}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
}
