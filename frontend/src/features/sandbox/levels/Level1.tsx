import { useState, useEffect, useCallback } from "react";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";

declare global {
  interface Window {
    levelSuccess: () => void;
  }
}

interface LevelProps {
  onSuccess: () => void;
}

interface Comment {
  id: number;
  user_id: number;
  level_id: string;
  content: string;
  created_at: string;
}

function getInitials(userId: number) {
  const names = ["JD", "AS", "MK", "OB", "TP"];
  return names[userId % names.length];
}

function getAvatarColor(userId: number) {
  const colors = ["#6f42c1", "#0d6efd", "#198754", "#fd7e14", "#dc3545"];
  return colors[userId % colors.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Level1({ onSuccess }: LevelProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    window.levelSuccess = onSuccess;
    return () => {
      delete (window as Partial<Window>).levelSuccess;
    };
  }, [onSuccess]);

  const loadComments = useCallback(async () => {
    if (!token) return;
    try {
      setComments(await sandboxApi.getComments(token, "1"));
    } catch {
      /* empty */
    }
  }, [token]);

  useEffect(() => {
    if (token) loadComments();
  }, [token, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !comment.trim()) return;
    setLoading(true);
    try {
      await sandboxApi.createComment(token, "1", comment);
      setComment("");
      await loadComments();
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!token) return;
    await sandboxApi.deleteComments(token, "1");
    await loadComments();
  };

  return (
    <div>
      <h3>Уровень 1: Stored XSS</h3>
      <p>
        Комментарии сохраняются на сервере и отображаются всем пользователям без
        фильтрации. Выполните произвольный JavaScript.
      </p>
      <p>
        Подсказка: используйте HTML-атрибуты событий, например{" "}
        <code>{'<img src=x onerror="levelSuccess()">'}</code>
      </p>

      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow url="devblog.io/articles/web-security-2026#comments">
          <div
            style={{
              background: "#f0f2f5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)",
                padding: "28px 32px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#7c83a0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                }}
              >
                DevBlog · Безопасность
              </div>
              <h2
                style={{
                  color: "#e2e8f0",
                  fontSize: "22px",
                  fontWeight: "700",
                  margin: "0 0 12px",
                  lineHeight: "1.3",
                }}
              >
                Топ-10 уязвимостей веб-приложений в 2026 году
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  color: "#7c83a0",
                  fontSize: "13px",
                }}
              >
                <span>✍️ sec_researcher</span>
                <span>📅 18 апр 2026</span>
                <span>⏱ 5 мин чтения</span>
              </div>
            </div>

            <div style={{ background: "#fff", padding: "24px 32px" }}>
              <form onSubmit={handleSubmit} style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Оставить комментарий
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Поделитесь мыслями..."
                  disabled={loading}
                  rows={3}
                  style={{
                    width: "100%",
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    color: "#1a1a1a",
                    padding: "12px 14px",
                    fontSize: "14px",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading || !comment.trim()}
                    style={{
                      background: loading ? "#6c757d" : "#0d6efd",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: loading ? "default" : "pointer",
                      opacity: !comment.trim() ? 0.6 : 1,
                    }}
                  >
                    {loading ? "Публикация..." : "Опубликовать"}
                  </button>
                </div>
              </form>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #f0f2f5",
                }}
              >
                <div
                  style={{
                    color: "#1a1a1a",
                    fontSize: "15px",
                    fontWeight: "700",
                  }}
                >
                  Комментарии ({comments.length})
                </div>
                {comments.length > 0 && (
                  <button
                    onClick={handleClear}
                    style={{
                      background: "transparent",
                      border: "1px solid #f5c2c7",
                      color: "#dc3545",
                      borderRadius: "5px",
                      padding: "4px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Очистить
                  </button>
                )}
              </div>

              {comments.length === 0 ? (
                <div
                  style={{
                    color: "#adb5bd",
                    textAlign: "center",
                    padding: "24px 0",
                    fontSize: "14px",
                  }}
                >
                  Будьте первым, кто оставит комментарий
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0" }}
                >
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "16px 0",
                        borderBottom: "1px solid #f0f2f5",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: getAvatarColor(c.user_id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(c.user_id)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "baseline",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              color: "#1a1a1a",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            user_{c.user_id}
                          </span>
                          <span style={{ color: "#adb5bd", fontSize: "12px" }}>
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#495057",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            textAlign: "left",
                          }}
                          dangerouslySetInnerHTML={{ __html: c.content }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
}
