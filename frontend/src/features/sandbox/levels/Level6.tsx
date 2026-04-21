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
    <div>
      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow url="files.corp-internal.io/documents">
          <div style={{ background: "#f8fafc", minHeight: "420px" }}>
            <div
              style={{
                background: "#fff",
                borderBottom: "1px solid #e2e8f0",
                padding: "12px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                Document Server
              </div>
              <div
                style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}
              >
                GET /documents?name=&lt;filename&gt;
              </div>
            </div>

            <div
              style={{
                display: "flex",
                height: "calc(100% - 57px)",
                minHeight: "363px",
              }}
            >
              <div
                style={{
                  width: "220px",
                  borderRight: "1px solid #e2e8f0",
                  background: "#fff",
                  padding: "12px 0",
                }}
              >
                <div
                  style={{
                    padding: "4px 16px 8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Files
                </div>
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

              <div style={{ flex: 1, padding: "20px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (filename.trim()) fetchFile(filename);
                  }}
                  style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
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
                    <div
                      style={{
                        color: "#cbd5e1",
                        fontSize: "13px",
                        textAlign: "center",
                        paddingTop: "16px",
                      }}
                    >
                      Выберите файл или введите путь вручную
                    </div>
                    <div
                      style={{
                        marginTop: "16px",
                        background: "#fef9c3",
                        border: "1px solid #fde68a",
                        borderRadius: "6px",
                        padding: "10px 14px",
                        fontSize: "12px",
                        color: "#78350f",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        Подсказка
                      </div>
                      <div style={{ marginBottom: "4px" }}>
                        Файлы читаются относительно{" "}
                        <code style={{ fontSize: "11px" }}>
                          /var/www/files/
                        </code>
                        . Используйте{" "}
                        <code style={{ fontSize: "11px" }}>..</code> для выхода
                        за её пределы.
                      </div>
                      <div>
                        Например:{" "}
                        <code style={{ fontSize: "11px" }}>
                          ../../etc/passwd
                        </code>
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
    </div>
  );
}
