import { useState, type ReactNode } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { DevTools, type DevtoolsTab } from "@/shared/ui/DevTools/DevTools";
import styles from "./BrowserWindow.module.scss";

interface NavItem {
  label: string;
  active?: boolean;
}

interface BrowserWindowProps {
  url: string;
  children: ReactNode;
  navbar?: NavItem[];
  appName?: string;
  appColor?: string;
  onNavigate?: (url: string) => void;
  devtoolsSlots?: Partial<Record<DevtoolsTab, ReactNode>>;
  devtoolsDefaultTab?: DevtoolsTab;
}

function ErrorPage({ url }: { url: string }) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorTitle}>Этот сайт недоступен</div>
      <div className={styles.errorSubtitle}>
        <strong>{url}</strong> не отвечает.
      </div>
      <div className={styles.errorCode}>ERR_NAME_NOT_RESOLVED</div>
    </div>
  );
}

export function BrowserWindow({
  url,
  children,
  navbar,
  appName,
  appColor = "#6366f1",
  onNavigate,
  devtoolsSlots,
  devtoolsDefaultTab,
}: BrowserWindowProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [navigatedAway, setNavigatedAway] = useState(false);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const [prevUrl, setPrevUrl] = useState(url);

  if (prevUrl !== url) {
    setPrevUrl(url);
    setInputUrl(url);
    setNavigatedAway(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl === url) return;
    if (onNavigate) {
      onNavigate(inputUrl);
    } else {
      setNavigatedAway(true);
    }
  };

  const showNavbar = !!(navbar?.length || appName);
  const siteHost = url.replace(/^https?:\/\//, "").split("/")[0];

  return (
    <div className={styles.root}>
      {/* Chrome bar */}
      <div className={styles.chrome}>
        <div className={styles.dots}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} className={styles.dot} style={{ background: c }} />
          ))}
        </div>
        <form
          className={styles.addressBar}
          onSubmit={handleSubmit}
          onClick={(e) => {
            (e.currentTarget as HTMLFormElement)
              .querySelector("input")
              ?.select();
          }}
        >
          <span className={styles.addressLock}>🔒</span>
          <input
            className={styles.addressInput}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
        </form>
        <Button
          variant="ghost"
          className={`${styles.f12Button} ${devtoolsOpen ? styles.active : ""}`}
          onClick={() => setDevtoolsOpen((v) => !v)}
          title="Toggle DevTools"
        >
          F12
        </Button>
      </div>

      {/* Navbar */}
      {showNavbar && (
        <div className={styles.navbar}>
          {appName && (
            <div className={styles.appName}>
              <div
                className={styles.appNameIcon}
                style={{ background: appColor }}
              >
                {appName[0].toUpperCase()}
              </div>
              <span className={styles.appNameText}>{appName}</span>
            </div>
          )}
          {navbar && navbar.length > 0 && (
            <div className={styles.navItems}>
              {navbar.map((item) => (
                <div
                  key={item.label}
                  className={`${styles.navItem} ${item.active ? styles.active : ""}`}
                  style={
                    item.active ? { borderBottomColor: appColor } : undefined
                  }
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
          {appName && navbar && navbar.length > 0 && (
            <div className={styles.navSpacer} />
          )}
        </div>
      )}

      {/* Content + DevTools side by side */}
      <div className={styles.body}>
        <div className={styles.content}>
          {navigatedAway ? <ErrorPage url={inputUrl} /> : children}
        </div>
        {devtoolsOpen && (
          <DevTools
            slots={devtoolsSlots}
            defaultTab={devtoolsDefaultTab}
            siteUrl={siteHost}
          />
        )}
      </div>
    </div>
  );
}
