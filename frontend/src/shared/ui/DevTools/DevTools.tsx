import { useState, type ReactNode } from "react";
import styles from "./DevTools.module.scss";

export type DevtoolsTab =
  | "Elements"
  | "Console"
  | "Sources"
  | "Network"
  | "Application"
  | "Memory";

const TABS: DevtoolsTab[] = [
  "Elements",
  "Console",
  "Sources",
  "Network",
  "Application",
  "Memory",
];

function DefaultElements() {
  const rows = [
    { indent: 0, text: '▼ <html lang="ru">', cls: styles.domRow },
    { indent: 1, text: "▼ <head>", cls: styles.domRow },
    { indent: 2, text: '<meta charset="UTF-8">', cls: styles.domRowMuted },
    { indent: 2, text: "<title>...</title>", cls: styles.domRowMuted },
    { indent: 1, text: "</head>", cls: styles.domRow },
    { indent: 1, text: "▼ <body>", cls: styles.domRow },
    { indent: 2, text: '▼ <div id="root">', cls: styles.domRow },
    { indent: 3, text: '▼ <div class="app">', cls: styles.domRow },
    { indent: 4, text: "== $0", cls: styles.domRowComment },
  ];
  return (
    <div className={styles.defaultElements}>
      {rows.map((row, i) => (
        <div
          key={i}
          className={row.cls}
          style={{ paddingLeft: `${row.indent * 16}px` }}
        >
          {row.text}
        </div>
      ))}
    </div>
  );
}

function DefaultConsole() {
  const entries = [
    { type: "log", msg: "Document ready", src: "app.js:1" },
    { type: "info", msg: "Session initialized", src: "session.js:14" },
    { type: "log", msg: "GET /api/user/me 200 (OK)", src: "xhr.js:88" },
    { type: "warn", msg: "Cookie без флага HttpOnly", src: "security.js:3" },
  ];
  return (
    <div>
      {entries.map((e, i) => (
        <div
          key={i}
          className={`${styles.consoleRow} ${styles[e.type as keyof typeof styles]}`}
        >
          <span>
            {e.type === "warn" ? "⚠" : e.type === "info" ? "ℹ" : "›"} {e.msg}
          </span>
          <span className={styles.consoleSrc}>{e.src}</span>
        </div>
      ))}
    </div>
  );
}

function DefaultSources() {
  return (
    <div className={styles.sourcesRoot}>
      <div className={styles.sourcesTree}>
        <div className={styles.sourcesTreeHeader}>Files</div>
        {["app.js", "session.js", "analytics.js", "styles.css"].map((f) => (
          <div key={f} className={styles.sourcesFile}>
            📄 {f}
          </div>
        ))}
      </div>
      <div className={styles.sourcesEmpty}>Select a file to view source</div>
    </div>
  );
}

function DefaultNetwork() {
  const rows = [
    { method: "GET", url: "/api/user/me", status: 200, time: "43ms" },
    { method: "GET", url: "/api/config", status: 200, time: "12ms" },
    { method: "POST", url: "/api/analytics", status: 204, time: "8ms" },
    { method: "GET", url: "/static/app.js", status: 304, time: "2ms" },
  ];
  return (
    <div>
      <div className={styles.networkHeader}>
        {["Method", "Name", "Status", "Time"].map((h) => (
          <span key={h} className={styles.networkHeaderCell}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} className={styles.networkRow}>
          <span
            className={`${styles.networkMethod} ${styles[r.method.toLowerCase() as keyof typeof styles] ?? styles.other}`}
          >
            {r.method}
          </span>
          <span className={styles.networkUrl}>{r.url}</span>
          <span
            className={`${styles.networkStatus} ${r.status < 300 ? styles.ok : styles.err}`}
          >
            {r.status}
          </span>
          <span className={styles.networkTime}>{r.time}</span>
        </div>
      ))}
    </div>
  );
}

function DefaultApplication({ siteUrl }: { siteUrl?: string }) {
  const token = localStorage.getItem("token");
  const displayToken = token ? token.slice(0, 36) + "…" : "—";
  const siteLabel = siteUrl
    ? `🌐 ${siteUrl.replace(/^https?:\/\//, "").split("/")[0]}`
    : "🌐 localhost";

  return (
    <div className={styles.appRoot}>
      <div className={styles.appSidebar}>
        <div className={styles.appSidebarHeader}>Storage</div>
        <div className={styles.appSidebarItem}>▼ Local Storage</div>
        <div className={styles.appSidebarSelected}>{siteLabel}</div>
        {["▶ Session Storage", "▶ IndexedDB", "▶ Cookies"].map((item) => (
          <div key={item} className={styles.appSidebarItem}>
            {item}
          </div>
        ))}
      </div>
      <div className={styles.appTable}>
        <div className={styles.appTableHeader}>
          {["Key", "Value"].map((h) => (
            <span key={h} className={styles.appTableHeaderCell}>
              {h}
            </span>
          ))}
        </div>
        <div className={styles.appTableRow}>
          <span className={styles.appTableKey}>token</span>
          <span className={styles.appTableValue}>{displayToken}</span>
        </div>
      </div>
    </div>
  );
}

function DefaultMemory() {
  const rows = [
    ["JS Heap Size", "4.2 MB"],
    ["Used JS Heap", "2.8 MB"],
    ["External Memory", "1.1 MB"],
    ["Objects Count", "14,832"],
  ];
  return (
    <div className={styles.memoryRoot}>
      <div className={styles.memoryTitle}>Heap Snapshot</div>
      {rows.map(([k, v]) => (
        <div key={k} className={styles.memoryRow}>
          <span>{k}</span>
          <span className={styles.memoryValue}>{v}</span>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_TAB_CONTENT: Record<
  DevtoolsTab,
  (props: { siteUrl?: string }) => ReactNode
> = {
  Elements: () => <DefaultElements />,
  Console: () => <DefaultConsole />,
  Sources: () => <DefaultSources />,
  Network: () => <DefaultNetwork />,
  Application: ({ siteUrl }) => <DefaultApplication siteUrl={siteUrl} />,
  Memory: () => <DefaultMemory />,
};

interface DevToolsProps {
  slots?: Partial<Record<DevtoolsTab, ReactNode>>;
  defaultTab?: DevtoolsTab;
  siteUrl?: string;
}

export function DevTools({
  slots,
  defaultTab = "Elements",
  siteUrl,
}: DevToolsProps) {
  const [activeTab, setActiveTab] = useState<DevtoolsTab>(defaultTab);
  const content =
    slots?.[activeTab] ?? DEFAULT_TAB_CONTENT[activeTab]({ siteUrl });

  return (
    <div className={styles.root}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tab} ${tab === activeTab ? styles.active : ""}`}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className={styles.content}>{content}</div>
    </div>
  );
}
