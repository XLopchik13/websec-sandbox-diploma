import { useState } from "react";
import { sandboxApi } from "@/entities/sandbox/api";

interface LevelProps {
  onSuccess: () => void;
}

interface Account {
  id: number;
  username: string;
  role: string;
}

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#3d0000", color: "#fc8181" },
  moderator: { bg: "#3d2800", color: "#f6ad55" },
  user: { bg: "#1a2d4a", color: "#63b3ed" },
};

export function Level2({ onSuccess }: LevelProps) {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<Account[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !username.trim()) return;
    setLoading(true);
    try {
      const data = await sandboxApi.sqliSearch(token, username);
      setResults(data);
      setSearched(true);
      if (data.some((r) => r.role === "admin")) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    setResetLoading(true);
    try {
      await sandboxApi.sqliReset(token);
      setResults([]);
      setSearched(false);
      setUsername("");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      <h3>Уровень 2: SQL Injection</h3>
      <p>
        Форма поиска формирует SQL-запрос через конкатенацию строк без
        параметризации.
      </p>
      <p>
        Цель: получить запись с ролью <code>admin</code>.
      </p>
      <p>
        Подсказка: <code>{"' OR role='admin' --"}</code>
      </p>

      <div
        style={{
          background: "#0f172a",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}
            >
              HR Admin Panel — Employee Database
            </span>
          </div>
          <span style={{ color: "#475569", fontSize: "12px" }}>
            v2.4.1 · Internal
          </span>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "6px 12px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#475569", fontSize: "16px" }}>🔍</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Поиск по имени сотрудника..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  padding: "4px 0",
                }}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                style={{
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: loading ? "default" : "pointer",
                  opacity: !username.trim() ? 0.5 : 1,
                }}
              >
                {loading ? "..." : "Найти"}
              </button>
            </div>
          </form>

          {searched && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  Найдено записей: {results.length}
                </span>
                <button
                  onClick={handleReset}
                  disabled={resetLoading}
                  style={{
                    background: "transparent",
                    border: "1px solid #4a3030",
                    color: "#fc8181",
                    borderRadius: "5px",
                    padding: "3px 10px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {resetLoading ? "..." : "Сбросить данные"}
                </button>
              </div>

              {results.length === 0 ? (
                <div
                  style={{
                    color: "#475569",
                    textAlign: "center",
                    padding: "32px 0",
                    fontSize: "14px",
                  }}
                >
                  Сотрудники не найдены
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e293b" }}>
                      {["ID", "Имя пользователя", "Роль"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            color: "#475569",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            fontSize: "11px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const badge = ROLE_BADGE[r.role] ?? ROLE_BADGE.user;
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: "1px solid #1e293b",
                            background:
                              r.role === "admin"
                                ? "rgba(220,53,69,0.07)"
                                : "transparent",
                          }}
                        >
                          <td
                            style={{ padding: "10px 12px", color: "#475569" }}
                          >
                            {r.id}
                          </td>
                          <td
                            style={{ padding: "10px 12px", color: "#e2e8f0" }}
                          >
                            {r.username}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                              }}
                            >
                              {r.role}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!searched && (
            <div
              style={{
                color: "#334155",
                textAlign: "center",
                padding: "32px 0",
                fontSize: "13px",
              }}
            >
              Введите имя для поиска по базе сотрудников
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
