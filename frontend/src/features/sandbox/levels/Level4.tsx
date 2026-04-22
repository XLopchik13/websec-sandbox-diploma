import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import descriptionIcon from "@/assets/description.svg";
import mailIcon from "@/assets/mail.svg";
import articleIcon from "@/assets/article.svg";
import settingsIcon from "@/assets/settings.svg";
import adminPanelIcon from "@/assets/admin_panel.svg";
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

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const p = token.split(".")[1];
    return JSON.parse(b64urlDecode(p));
  } catch {
    return null;
  }
}

type VerifyResult =
  | {
      ok: true;
      data: { access: string; role: string; message: string; secret: string };
    }
  | { ok: false; status: number };

const ACCESS_TILES = [
  { icon: descriptionIcon, label: "Мои документы" },
  { icon: mailIcon, label: "Сообщения" },
  { icon: articleIcon, label: "Отчёты" },
  { icon: settingsIcon, label: "Настройки" },
];

export function Level4({ onSuccess }: LevelProps) {
  const [savedToken, setSavedToken] = useState("");
  const [editedToken, setEditedToken] = useState("");
  const [rowSelected, setRowSelected] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) return;
    sandboxApi
      .jwtGetToken(authToken)
      .then(({ token }) => {
        setSavedToken(token);
        setEditedToken(token);
      })
      .finally(() => setFetchLoading(false));
  }, [authToken]);

  const handleSave = () => {
    if (!editedToken.trim()) return;
    setSavedToken(editedToken);
    setResult(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const handleAdminPanel = async () => {
    if (!authToken || !savedToken || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await sandboxApi.jwtVerify(authToken, savedToken);
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

  const payloadRole = (parseJwtPayload(savedToken)?.role as string) ?? "user";
  const truncatedToken =
    savedToken.length > 48 ? savedToken.slice(0, 48) + "…" : savedToken;

  const adminTileClass = [
    styles.adminTile,
    result?.ok ? styles.success : "",
    result && !result.ok ? styles.error : "",
    loading ? styles.busy : "",
  ]
    .filter(Boolean)
    .join(" ");

  const applicationSlot = (
    <div className={styles.devtoolsLayout}>
      <div className={styles.dtSidebar}>
        <div className={styles.dtSidebarSection}>Storage</div>
        <div className={styles.dtSidebarItem}>▼ Local Storage</div>
        <div className={styles.dtSidebarItemActive}>
          🌐 sso.corp-internal.io
        </div>
        {["▶ Session Storage", "▶ IndexedDB", "▶ Cookies"].map((item) => (
          <div key={item} className={styles.dtSidebarItemSub}>
            {item}
          </div>
        ))}
      </div>

      <div className={styles.dtMain}>
        <div className={styles.dtTableHeader}>
          {["Key", "Value"].map((h) => (
            <span key={h} className={styles.dtTableHeaderCell}>
              {h}
            </span>
          ))}
        </div>

        <div
          onClick={() => setRowSelected((v) => !v)}
          className={`${styles.dtTableRow} ${rowSelected ? styles.selected : ""}`}
        >
          <span className={styles.dtRowKey}>corp_session</span>
          <span className={styles.dtRowValue}>{truncatedToken || "—"}</span>
        </div>

        {rowSelected && (
          <div className={styles.dtEditor}>
            <div className={styles.dtEditorLabel}>
              <span className={styles.dtEditorKey}>corp_session</span>
            </div>
            <textarea
              value={editedToken}
              onChange={(e) => setEditedToken(e.target.value)}
              rows={5}
              spellCheck={false}
              className={styles.dtTextarea}
            />
            <Button
              onClick={handleSave}
              disabled={!editedToken.trim()}
              className={justSaved ? styles.saveBtnSaved : styles.saveBtn}
            >
              {justSaved ? "✓ Сохранено" : "Save changes to localStorage"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <BrowserWindow
        url="sso.corp-internal.io/dashboard"
        appName="CorpPortal"
        appColor="#f97316"
        devtoolsSlots={{ Application: applicationSlot }}
        devtoolsDefaultTab="Application"
      >
        <div className={styles.page}>
          <div className={styles.pageContent}>
            {fetchLoading ? (
              <div className={styles.loadingText}>Загрузка сессии...</div>
            ) : (
              <>
                <div className={styles.pageHeader}>
                  <div>
                    <div className={styles.welcomeTitle}>Добро пожаловать</div>
                    <div className={styles.accessLevel}>
                      Уровень доступа:{" "}
                      <strong>
                        {payloadRole === "admin"
                          ? "Администратор"
                          : "Стандартный пользователь"}
                      </strong>
                    </div>
                  </div>
                  <div className={styles.userBadge}>
                    <div className={styles.userAvatar}>U</div>
                    <span className={styles.userName}>user</span>
                    <span
                      className={styles.userRole}
                      style={{
                        background:
                          payloadRole === "admin" ? "#14532d" : "#1e3a5f",
                        color: payloadRole === "admin" ? "#86efac" : "#63b3ed",
                      }}
                    >
                      {payloadRole}
                    </span>
                  </div>
                </div>

                <div className={styles.tilesGrid}>
                  {ACCESS_TILES.map((tile) => (
                    <div key={tile.label} className={styles.tile}>
                      <div className={styles.tileIconWrap}>
                        <img
                          src={tile.icon}
                          alt=""
                          className={styles.tileIcon}
                        />
                      </div>
                      <div className={styles.tileLabel}>{tile.label}</div>
                    </div>
                  ))}

                  <div
                    onClick={loading ? undefined : handleAdminPanel}
                    className={adminTileClass}
                  >
                    <div className={styles.tileIconWrap}>
                      <img
                        src={adminPanelIcon}
                        alt=""
                        className={styles.tileIcon}
                      />
                    </div>
                    <div className={styles.adminTileLabel}>Admin Panel</div>
                    <div className={styles.adminTileStatus}>
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
                  <div className={styles.successBox}>
                    <div className={styles.successTitle}>
                      ✅ {result.data.message}
                    </div>
                    <div className={styles.successSecret}>
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
  );
}
