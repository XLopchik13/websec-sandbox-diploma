import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";

interface LevelProps {
  onSuccess: () => void;
}

export function Level1({ onSuccess }: LevelProps) {
  const [comment, setComment] = useState("");
  const [submittedComment, setSubmittedComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedComment(comment);

    // Простейшая проверка: если в комментарии есть <script>, считаем, что уязвимость найдена
    // В реальном сценарии XSS сработает в браузере, но для обучения мы можем фиксировать ввод
    if (comment.includes("<script>")) {
      onSuccess();
    }
  };

  return (
    <div>
      <h3>Уровень 1: Хранимая XSS (ввод)</h3>
      <p>Попробуйте выполнить скрипт в поле комментария.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <Input
          label="Ваш комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите текст..."
        />
        <Button type="submit" style={{ marginTop: "10px" }}>
          Опубликовать
        </Button>
      </form>

      {submittedComment && (
        <div
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <strong>Последний комментарий:</strong>
          {/* Уязвимый вывод: используем dangerouslySetInnerHTML для демонстрации XSS */}
          <div dangerouslySetInnerHTML={{ __html: submittedComment }} />
        </div>
      )}
    </div>
  );
}
