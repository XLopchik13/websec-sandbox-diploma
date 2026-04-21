import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level4.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return atob(s);
  }
}

function b64urlEncode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function parseJwt(token: string): { header: object; payload: object } | null {
  try {
    const [h, p] = token.split(".");
    return {
      header: JSON.parse(b64urlDecode(h)),
      payload: JSON.parse(b64urlDecode(p)),
    };
  } catch {
    return null;
  }
}

function buildToken(header: string, payload: string): string {
  try {
    JSON.parse(header);
    JSON.parse(payload);
    return `${b64urlEncode(header)}.${b64urlEncode(payload)}.`;
  } catch {
    return "";
  }
}

type ApiResult =
  | {
      ok: true;
      data: { access: string; role: string; message: string; secret: string };
    }
  | { ok: false; status: number };

const ACCESS_TILES = [
  { icon: "📄", label: "Мои документы" },
  { icon: "📧", label: "Сообщения" },
  { icon: "📊", label: "Отчёты" },
  { icon: "⚙️", label: "Настройки" },
];

export function Level4({ onSuccess }: LevelProps) {
  const [headerJson, setHeaderJson] = useState("");
  const [payloadJson, setPayloadJson] = useState("");
  const [rowSelected, setRowSelected] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) return;
    sandboxApi
      .jwtGetToken(authToken)
      .then(({ token }) => {
        const parsed = parseJwt(token);
        if (parsed) {
          setHeaderJson(JSON.stringify(parsed.header, null, 2));
          setPayloadJson(JSON.stringify(parsed.payload, null, 2));
        }
      })
      .finally(() => setFetchLoading(false));
  }, [authToken]);

  const constructedToken = buildToken(headerJson, payloadJson);

  const handleApply = async () => {
    if (!authToken || !constructedToken) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await sandboxApi.jwtVerify(authToken, constructedToken);
      setResult({ ok: true, data });
      onSuccess();
    } catch (e: unknown) {
      const status =
        e && typeof e === "object" && "status" in e
          ? (e as { status: number }).status
          : 403;
      setResult({ ok: false, status });
    } finally {
      setLoading(false);
    }
  };

  let payloadRole = "user";
  try {
    payloadRole = (JSON.parse(payloadJson) as { role?: string }).role ?? "user";
  } catch {
    /* empty */
  }

  const truncatedToken =
    constructedToken.length > 48
      ? constructedToken.slice(0, 48) + "…"
      : constructedToken;

  const applicationSlot = (
    <div style={{ display: "flex", height: "100%" }}>
      <div
        style={{
          width: "200px",
          flexShrink: 0,
          background: "#252526",
          borderRight: "1px solid #3c3c3c",
          padding: "8px 0",
          fontSize: "12px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            color: "#9d9d9d",
            padding: "2px 12px",
            fontWeight: 600,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          Storage
        </div>
        <div style={{ color: "#9d9d9d", padding: "3px 12px 3px 20px" }}>
          ▼ Local Storage
        </div>
        <div
          style={{
            padding: "3px 12px 3px 32px",
            color: "#fff",
            background: "#094771",
            cursor: "default",
          }}
        >
          🌐 sso.corp-internal.io
        </div>
        {["▶ Session Storage", "▶ IndexedDB", "▶ Cookies"].map((item) => (
          <div
            key={item}
            style={{
              color: "#9d9d9d",
              padding: "3px 12px 3px 20px",
              marginTop: "2px",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#2d2d2d",
            borderBottom: "1px solid #3c3c3c",
            padding: "4px 12px",
          }}
        >
          {["Key", "Value"].map((h) => (
            <span
              key={h}
              style={{ fontSize: "11px", color: "#9d9d9d", fontWeight: 600 }}
            >
              {h}
            </span>
          ))}
        </div>

        <div
          onClick={() => setRowSelected((v) => !v)}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "5px 12px",
            cursor: "pointer",
            background: rowSelected ? "#094771" : "transparent",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: rowSelected ? "#fff" : "#ce9178",
              fontFamily: "monospace",
            }}
          >
            corp_session
          </span>
          <span
            style={{
              fontSize: "12px",
              color: rowSelected ? "#ccc" : "#9cdcfe",
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncatedToken || "—"}
          </span>
        </div>

        {rowSelected && (
          <div
            style={{
              flex: 1,
              borderTop: "1px solid #3c3c3c",
              background: "#1e1e1e",
              padding: "10px 12px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#9d9d9d",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Decoded:{" "}
              <span style={{ color: "#ce9178", fontFamily: "monospace" }}>
                corp_session
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#f97316",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Header
                </div>
                <textarea
                  value={headerJson}
                  onChange={(e) => setHeaderJson(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    background: "#0d0d0d",
                    border: "1px solid #f9731640",
                    borderRadius: "4px",
                    color: "#f97316",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    padding: "6px 8px",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#9cdcfe",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Payload
                </div>
                <textarea
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    background: "#0d0d0d",
                    border: "1px solid #9cdcfe40",
                    borderRadius: "4px",
                    color: "#9cdcfe",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    padding: "6px 8px",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handleApply}
              disabled={loading || !constructedToken}
              className={styles.saveBtn}
            >
              {loading ? "Отправка..." : "Save changes to localStorage"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "0" }}>
        <BrowserWindow
          url="sso.corp-internal.io/dashboard"
          appName="CorpPortal"
          appColor="#f97316"
          devtoolsSlots={{ Application: applicationSlot }}
          devtoolsDefaultTab="Application"
        >
          <div style={{ background: "#f1f5f9" }}>
            <div style={{ padding: "24px 20px" }}>
              {fetchLoading ? (
                <div
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  Загрузка сессии...
                </div>
              ) : (
                <>
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
                          marginBottom: "4px",
                        }}
                      >
                        Добро пожаловать
                      </div>
                      <div style={{ color: "#64748b", fontSize: "13px" }}>
                        Уровень доступа:{" "}
                        <strong>
                          {payloadRole === "admin"
                            ? "Администратор"
                            : "Стандартный пользователь"}
                        </strong>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: "#0f172a",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "#6366f1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        U
                      </div>
                      <span style={{ color: "#e2e8f0", fontSize: "13px" }}>
                        user
                      </span>
                      <span
                        style={{
                          background:
                            payloadRole === "admin" ? "#14532d" : "#1e3a5f",
                          color:
                            payloadRole === "admin" ? "#86efac" : "#63b3ed",
                          padding: "1px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {payloadRole}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    {ACCESS_TILES.map((tile) => (
                      <div
                        key={tile.label}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "16px 12px",
                          textAlign: "center",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                          {tile.icon}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        >
                          {tile.label}
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={handleApply}
                      style={{
                        background: result?.ok ? "#f0fdf4" : "#fff",
                        border: `1px solid ${result?.ok ? "#86efac" : result ? "#fecaca" : "#e2e8f0"}`,
                        borderRadius: "10px",
                        padding: "16px 12px",
                        textAlign: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        cursor: loading ? "default" : "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                        {result?.ok ? "✅" : "🔒"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: result?.ok ? "#16a34a" : "#475569",
                          fontWeight: 600,
                        }}
                      >
                        Admin Panel
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: result?.ok
                            ? "#16a34a"
                            : result
                              ? "#dc2626"
                              : "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        {loading
                          ? "..."
                          : result?.ok
                            ? "Доступ открыт"
                            : result
                              ? `${result.status} ${result.status === 400 ? "Bad Request" : "Forbidden"}`
                              : "Нет доступа"}
                      </div>
                    </div>
                  </div>

                  {result?.ok && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "#166534",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        ✅ {result.data.message}
                      </div>
                      <div style={{ fontFamily: "monospace" }}>
                        secret: {result.data.secret}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
}
