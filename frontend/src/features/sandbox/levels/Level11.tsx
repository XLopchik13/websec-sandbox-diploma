import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level11.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

interface Package {
  name: string;
  version: string;
  downloads: string;
  description: string;
  author: string;
  published: string;
  verified: boolean;
  postinstall: string | null;
}

const TERMINAL_DOTS = ["#ff5f57", "#febc2e", "#28c840"];

export function Level11({ onSuccess }: LevelProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [attackDone, setAttackDone] = useState(false);
  const token = localStorage.getItem("token")!;

  useEffect(() => {
    sandboxApi
      .supplyChainPackages(token)
      .then(setPackages)
      .catch(console.error);
  }, [token]);

  const handleInstall = async (pkgName: string) => {
    setInstalling(true);
    setOutput(null);
    try {
      const result = await sandboxApi.supplyChainInstall(token, pkgName);
      setOutput(result.output);
      if (result.malicious && !attackDone) {
        setAttackDone(true);
        onSuccess();
      }
    } finally {
      setInstalling(false);
    }
  };

  const isMalicious = (pkg: Package) =>
    !pkg.verified && pkg.postinstall !== null;

  return (
    <div className={styles.root}>
      <div className={styles.browserRow}>
        <div className={styles.registryCol}>
          <BrowserWindow
            url="registry.npmjs.org/search?q=chart"
            appName="npm"
            appColor="#cb3837"
          >
            <div
              style={{
                background: "#fff",
                minHeight: "420px",
                padding: "20px",
              }}
            >
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                chart
              </div>

              <div className={styles.packageList}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={[
                      styles.packageCard,
                      isMalicious(pkg) ? styles.malicious : "",
                      selected === pkg.name ? styles.selected : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelected(pkg.name)}
                  >
                    <div className={styles.packageHeader}>
                      <span className={styles.packageName}>{pkg.name}</span>
                      <span className={styles.packageVersion}>
                        v{pkg.version}
                      </span>
                      {pkg.verified && (
                        <span className={styles.verifiedBadge}>✓ VERIFIED</span>
                      )}
                    </div>
                    <div className={styles.packageDesc}>{pkg.description}</div>
                    <div className={styles.packageMeta}>
                      <span>⬇ {pkg.downloads}</span>
                      <span>👤 {pkg.author}</span>
                      <span>📅 {pkg.published}</span>
                    </div>
                    {pkg.postinstall && (
                      <div className={styles.postinstallWarning}>
                        ⚠ postinstall: {pkg.postinstall}
                      </div>
                    )}
                    {selected === pkg.name && (
                      <Button
                        className={styles.installBtn}
                        disabled={installing}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(pkg.name);
                        }}
                      >
                        {installing ? "..." : `npm install ${pkg.name}`}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </BrowserWindow>
        </div>

        <div className={styles.terminalCol}>
          <div className={styles.terminal}>
            <div className={styles.terminalHeader}>
              <div className={styles.terminalDots}>
                {TERMINAL_DOTS.map((c) => (
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
              <span className={styles.terminalTitle}>~/project</span>
            </div>
            <div className={styles.terminalBody}>
              {output === null ? (
                <div className={styles.terminalPlaceholder}>
                  {`// Выберите пакет из реестра`}
                  <br />
                  {`// и нажмите "npm install"`}
                </div>
              ) : (
                <>
                  <div className={styles.terminalPrompt}>
                    <span>➜</span> npm install {selected}
                  </div>
                  <pre className={styles.terminalOutput}>{output}</pre>
                </>
              )}
            </div>
          </div>

          {attackDone && (
            <div className={styles.successBanner}>
              <strong>⚠ Атака выполнена!</strong>
              Typosquatting-пакет <code>chartlib</code> выполнил
              postinstall-скрипт, который считал переменные окружения и отправил
              их на сервер злоумышленника. В реальной атаке это ведёт к
              компрометации production-инфраструктуры.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
