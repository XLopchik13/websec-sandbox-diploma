import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level5.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

type FetchResult = {
  status: number;
  content: string;
  secret: string | null;
};

const NAVBAR = [
  { label: "Dashboard" },
  { label: "Link Checker", active: true },
  { label: "Analytics" },
  { label: "Settings" },
];

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
      <BrowserWindow
        url="tools.corp-internal.io/link-checker"
        appName="LinkPeek"
        appColor="#6366f1"
        navbar={NAVBAR}
      >
        <div
          style={{
            background: "#f8fafc",
            padding: "24px",
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            minHeight: "420px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                URL Checker
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Сервис делает серверный HTTP-запрос и возвращает содержимое
                страницы.
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
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
                <Button
                  onClick={handleFetch}
                  disabled={loading || !url.trim()}
                  className={styles.fetchBtn}
                >
                  {loading ? "Fetching..." : "Fetch"}
                </Button>
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
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {url}
                  </span>
                  {succeeded && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        color: "#16a34a",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✅ Получены внутренние данные
                    </span>
                  )}
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "14px 16px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#e2e8f0",
                    background: "#0d1117",
                    overflowX: "auto",
                    maxHeight: "200px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textAlign: "left",
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

          <div
            style={{
              width: "200px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderBottom: "1px solid #e2e8f0",
                  fontWeight: "700",
                  color: "#0f172a",
                  fontSize: "12px",
                }}
              >
                Infrastructure
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {[
                  ["Provider", "AWS"],
                  ["Service", "EC2"],
                  ["Region", "us-east-1"],
                  ["Instance", "t3.medium"],
                  ["AMI", "ami-0c55b159"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        color: "#0f172a",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />
                  <span style={{ color: "#16a34a", fontSize: "11px" }}>
                    Running
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrowserWindow>
    </div>
  );
}
