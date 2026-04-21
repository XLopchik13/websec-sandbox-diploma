import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level9.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

const NAVBAR = [
  { label: "Обзор" },
  { label: "Диагностика", active: true },
  { label: "Трафик" },
  { label: "Журнал" },
];

const QUICK_HOSTS = ["8.8.8.8", "google.com", "192.168.1.1"];

export function Level9({ onSuccess }: LevelProps) {
  const [host, setHost] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [injected, setInjected] = useState(false);
  const token = localStorage.getItem("token")!;

  const runPing = async (target?: string) => {
    const h = target ?? host;
    if (!h.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const data = await sandboxApi.cmdiPing(token, h);
      setOutput(data.output);
      setInjected(data.injected);
      if (data.injected) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow
          url="nettools.corp-internal.io/diagnostics"
          appName="NetTools"
          appColor="#059669"
          navbar={NAVBAR}
        >
          <div
            style={{
              background: "#f8fafc",
              minHeight: "420px",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "2px",
                }}
              >
                Network Diagnostics
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Ping — проверка доступности хоста
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Хост или IP-адрес
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runPing()}
                  placeholder="example.com"
                  className={styles.input}
                />
                <Button
                  onClick={() => runPing()}
                  disabled={loading || !host.trim()}
                  className={styles.runBtn}
                >
                  {loading ? "..." : "▶ Ping"}
                </Button>
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                {QUICK_HOSTS.map((h) => (
                  <button
                    key={h}
                    className={styles.quickBtn}
                    onClick={() => {
                      setHost(h);
                      runPing(h);
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {output !== null && (
              <div className={styles.terminal}>
                <div className={styles.terminalHeader}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                      <div
                        key={c}
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: c,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    $ ping -c 4 {host}
                    {injected && (
                      <span className={styles.injectedBadge}>
                        {" "}
                        ⚠ injection detected
                      </span>
                    )}
                  </span>
                </div>
                <pre className={styles.terminalOutput}>{output}</pre>
              </div>
            )}
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
}
