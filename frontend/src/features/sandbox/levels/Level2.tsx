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
  admin: { bg: "#fee2e2", color: "#dc2626" },
  moderator: { bg: "#fef3c7", color: "#d97706" },
  user: { bg: "#dbeafe", color: "#2563eb" },
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

      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            background: "#2b2b2b",
            borderRadius: "10px 10px 0 0",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              background: "#3c3c3c",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              padding: "4px 10px",
              gap: "6px",
            }}
          >
            <span style={{ color: "#888", fontSize: "13px" }}>🔒</span>
            <span style={{ color: "#ccc", fontSize: "13px" }}>
              hr.corp-internal.io/employees/search
            </span>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "0 0 10px 10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              borderBottom: "1px solid #334155",
            }}
          >
            {["Главная", "Сотрудники", "Отделы", "Отчёты"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "14px 0",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: i === 1 ? "#38bdf8" : "#94a3b8",
                  borderBottom:
                    i === 1 ? "2px solid #38bdf8" : "2px solid transparent",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {item}
              </div>
            ))}
            <div
              style={{ marginLeft: "auto", color: "#475569", fontSize: "12px" }}
            >
              HR Portal v2.4.1
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  База сотрудников
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Поиск по имени пользователя
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "16px" }}>🔍</span>
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
                    color: "#0f172a",
                    fontSize: "14px",
                    padding: "4px 0",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 18px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: !username.trim() || loading ? "default" : "pointer",
                    opacity: !username.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? "..." : "Найти"}
                </button>
              </div>
            </form>

            {searched && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f8fafc",
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    Найдено: {results.length}
                  </span>
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    style={{
                      background: "transparent",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
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
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "40px 0",
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
                      <tr style={{ background: "#f8fafc" }}>
                        {["ID", "Имя пользователя", "Роль"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "10px 16px",
                              color: "#64748b",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              fontSize: "11px",
                              letterSpacing: "0.5px",
                              borderBottom: "1px solid #e2e8f0",
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
                              borderBottom: "1px solid #f1f5f9",
                              background:
                                r.role === "admin"
                                  ? "rgba(254,226,226,0.4)"
                                  : "transparent",
                            }}
                          >
                            <td
                              style={{ padding: "12px 16px", color: "#94a3b8" }}
                            >
                              {r.id}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#0f172a",
                                fontWeight: "500",
                              }}
                            >
                              {r.username}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
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
                  color: "#cbd5e1",
                  textAlign: "center",
                  padding: "40px 0",
                  fontSize: "13px",
                }}
              >
                Введите имя для поиска по базе сотрудников
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
