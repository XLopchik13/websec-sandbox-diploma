import { useState } from "react";
import { sandboxApi } from "@/entities/sandbox/api";

interface LevelProps {
  onSuccess: () => void;
}

type FetchResult = {
  status: number;
  content: string;
  secret: string | null;
};

const NAV_ITEMS = ["Dashboard", "Link Checker", "Analytics", "Settings"];

export function Level5({ onSuccess }: LevelProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const authToken = localStorage.getItem("token");

  const handleFetch = async () => {
    if (!authToken || !url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await sandboxApi.ssrfFetch(authToken, url.trim());
      setResult(data);
      if (data.secret) {
        setSucceeded(true);
        onSuccess();
      }
    } catch {
      setResult({ status: 0, content: "Network error", secret: null });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = !result
    ? "#64748b"
    : result.status >= 200 && result.status < 300
      ? "#16a34a"
      : result.status === 0
        ? "#dc2626"
        : "#d97706";

  return (
    <div>
      <h3>Уровень 5: SSRF</h3>
      <p>
        Корпоративный инструмент проверки ссылок делает серверный HTTP-запрос к
        любому указанному URL. Попробуй заставить сервер обратиться к внутренним
        адресам.
      </p>
      <p>Цель: получить секретные данные из внутренней инфраструктуры.</p>

      <div
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            background: "#2b2b2b",
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
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "#888", fontSize: "13px" }}>🔒</span>
            <span style={{ color: "#ccc", fontSize: "13px" }}>
              tools.corp-internal.io/link-checker
            </span>
          </div>
        </div>

        <div style={{ background: "#f8fafc" }}>
          <div
            style={{
              background: "#0f172a",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: "0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginRight: "24px",
                padding: "12px 0",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#fff",
                }}
              >
                L
              </div>
              <span
                style={{
                  color: "#e2e8f0",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                LinkPeek
              </span>
            </div>
            {NAV_ITEMS.map((item) => (
              <div
                key={item}
                style={{
                  padding: "14px 14px",
                  fontSize: "13px",
                  color: item === "Link Checker" ? "#fff" : "#94a3b8",
                  borderBottom:
                    item === "Link Checker"
                      ? "2px solid #6366f1"
                      : "2px solid transparent",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div style={{ padding: "28px 24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                URL Checker
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Проверяет доступность URL и возвращает содержимое страницы.
                Используется для предпросмотра ссылок перед публикацией во
                внутренних каналах.
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#475569",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                URL для проверки
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  placeholder="https://example.com"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    outline: "none",
                    color: "#0f172a",
                    background: "#f8fafc",
                  }}
                />
                <button
                  onClick={handleFetch}
                  disabled={loading || !url.trim()}
                  style={{
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: loading ? "default" : "pointer",
                    opacity: !url.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? "Fetching..." : "Fetch"}
                </button>
              </div>
            </div>

            {result && (
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${succeeded ? "#86efac" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: succeeded ? "#f0fdf4" : "#f8fafc",
                  }}
                >
                  <span
                    style={{
                      background: statusColor,
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "700",
                      fontFamily: "monospace",
                    }}
                  >
                    {result.status || "ERR"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {url}
                  </span>
                  {succeeded && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        color: "#16a34a",
                        fontWeight: "600",
                      }}
                    >
                      ✅ Внутренние данные получены
                    </span>
                  )}
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "14px 16px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#1e293b",
                    background: "#0d1117",
                    color: "#e2e8f0",
                    overflowX: "auto",
                    maxHeight: "220px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {result.content}
                </pre>
                {result.secret && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#f0fdf4",
                      borderTop: "1px solid #86efac",
                      fontSize: "13px",
                      color: "#166534",
                      fontFamily: "monospace",
                    }}
                  >
                    secret: {result.secret}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
