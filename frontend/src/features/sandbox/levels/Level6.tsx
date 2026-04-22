import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level6.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

const LISTED_FILES = [
  { name: "readme.txt", label: "readme.txt", icon: "📄" },
  { name: "notes.txt", label: "notes.txt", icon: "📝" },
  { name: "reports/q1-2025.txt", label: "reports/q1-2025.txt", icon: "📊" },
  { name: "reports/q2-2025.txt", label: "reports/q2-2025.txt", icon: "📊" },
];

export function Level6({ onSuccess }: LevelProps) {
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<{
    content: string | null;
    found: boolean;
    traversal: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token")!;

  const fetchFile = async (name: string) => {
    setLoading(true);
    setFilename(name);
    try {
      const data = await sandboxApi.pathTraversalRead(token, name);
      setResult(data);
      if (data.traversal && data.content?.includes("root:x:0:0:")) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <BrowserWindow url="files.corp-internal.io/documents">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <div className={styles.titleIcon}>C</div>
              Corporate Storage
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.sidebar}>
              <div className={styles.sidebarLabel}>Files</div>
              {LISTED_FILES.map((f) => (
                <button
                  key={f.name}
                  className={`${styles.fileItem} ${filename === f.name ? styles.active : ""}`}
                  onClick={() => fetchFile(f.name)}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.contentArea}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (filename.trim()) fetchFile(filename);
                }}
                className={styles.form}
              >
                <input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Введите имя файла..."
                  className={styles.input}
                />
                <Button
                  type="submit"
                  disabled={loading || !filename.trim()}
                  className={styles.fetchBtn}
                >
                  {loading ? "..." : "Открыть"}
                </Button>
              </form>

              {result === null && (
                <>
                  <div className={styles.emptyText}>
                    Выберите файл или введите путь вручную
                  </div>
                  <div className={styles.hint}>
                    <div className={styles.hintTitle}>Подсказка</div>
                    <div className={styles.hintText}>
                      Файлы читаются относительно <code>/var/www/files/</code>.
                      Используйте <code>..</code> для выхода за её пределы.
                    </div>
                    <div>
                      Например: <code>../../etc/passwd</code>
                    </div>
                  </div>
                </>
              )}
              {result !== null && !result.found && (
                <div className={styles.errorBox}>
                  ❌ Файл не найден: <code>{filename}</code>
                </div>
              )}
              {result?.found && (
                <div className={styles.fileContent}>
                  <div className={styles.fileHeader}>
                    <span>{filename}</span>
                    {result.traversal && (
                      <span className={styles.traversalBadge}>
                        ⚠ path traversal
                      </span>
                    )}
                  </div>
                  <pre className={styles.pre}>{result.content}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </BrowserWindow>
    </div>
  );
}
