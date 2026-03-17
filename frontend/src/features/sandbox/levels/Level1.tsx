import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import { sandboxApi } from "@/entities/sandbox/api";

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

export function Level1({ onSuccess }: LevelProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const loadComments = useCallback(async () => {
    if (!token) return;
    try {
      const data = await sandboxApi.getComments(token, "1");
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadComments();
    }
  }, [token, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !comment.trim()) return;

    setLoading(true);
    try {
      await sandboxApi.createComment(token, "1", comment);
      setComment("");
      await loadComments();

      // Проверяем, есть ли XSS в комментарии
      if (comment.includes("<script>")) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Уровень 1: Хранимая XSS</h3>
      <p>
        Попробуйте выполнить скрипт в поле комментария. Комментарии сохраняются
        на сервере и отображаются всем пользователям.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <Input
          label="Ваш комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите текст..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading} style={{ marginTop: "10px" }}>
          {loading ? "Публикация..." : "Опубликовать"}
        </Button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h4>Все комментарии:</h4>
        {comments.length === 0 ? (
          <p style={{ color: "#666" }}>Пока нет комментариев</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
              >
                {new Date(c.created_at).toLocaleString()}
              </div>
              {/* Уязвимый вывод: используем dangerouslySetInnerHTML для демонстрации XSS */}
              <div dangerouslySetInnerHTML={{ __html: c.content }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
