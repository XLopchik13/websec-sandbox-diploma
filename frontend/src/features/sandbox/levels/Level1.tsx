import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level1.module.scss";

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
    <div className={styles.wrapper}>
      <BrowserWindow url="devblog.io/articles/web-security-2026#comments">
        <div>
          <div className={styles.hero}>
            <div className={styles.heroCategory}>DevBlog · Безопасность</div>
            <h2 className={styles.heroTitle}>
              Топ-10 уязвимостей веб-приложений
            </h2>
            <div className={styles.heroMeta}>
              <span>Дата публикации: 18 апр 2026</span>
            </div>
          </div>

          <div className={styles.body}>
            <form onSubmit={handleSubmit} className={styles.commentForm}>
              <p className={styles.intro}>
                OWASP выпустил топ-10 самых актуальных категорий рисков и
                веб-атак за последние 5 лет:
              </p>
              <ol>
                <li>
                  Broken access control (BAC) — нарушение контроля доступа.
                </li>
                <li>
                  Security misconfiguration — нарушение безопасности
                  конфигураций.
                </li>
                <li>
                  Software supply chain failures — уязвимости в цепочке
                  поставок.
                </li>
                <li>Cryptographic failures — криптографические уязвимости.</li>
                <li>Injection — инъекции.</li>
                <li>Insecure design — небезопасное проектирование.</li>
                <li>Authentication failures — сбои аутентификации.</li>
                <li>
                  Software or data integrity failures — сбои в обеспечении
                  целостности ПО и данных.
                </li>
                <li>
                  Logging and alerting failures — сбои логирования и оповещения.
                </li>
                <li>
                  Mishandling or exceptional conditions — неправильная обработка
                  исключительных условий.
                </li>
              </ol>
              <div className={styles.commentLabel}>Оставить комментарий</div>
              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь мыслями..."
                disabled={loading}
                rows={3}
              />
              <div className={styles.submitRow}>
                <Button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className={styles.submitBtn}
                >
                  {loading ? "Публикация..." : "Опубликовать"}
                </Button>
              </div>
            </form>

            <div className={styles.commentsHeader}>
              <div className={styles.commentsCount}>
                Комментарии ({comments.length})
              </div>
              {comments.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className={styles.clearBtn}
                >
                  Очистить
                </Button>
              )}
            </div>

            {comments.length === 0 ? (
              <div className={styles.empty}>
                Будьте первым, кто оставит комментарий
              </div>
            ) : (
              <div>
                {comments.map((c) => (
                  <div key={c.id} className={styles.commentItem}>
                    <div
                      className={styles.avatar}
                      style={{ background: getAvatarColor(c.user_id) }}
                    >
                      {getInitials(c.user_id)}
                    </div>
                    <div>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>
                          user_{c.user_id}
                        </span>
                        <span className={styles.commentDate}>
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <div
                        className={styles.commentContent}
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
  );
}
