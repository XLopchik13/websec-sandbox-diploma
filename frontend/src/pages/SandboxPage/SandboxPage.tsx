import { useState, useEffect } from "react";
import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { Button } from "@/shared/ui/Button/Button";
import { SANDBOX_LEVELS } from "@/features/sandbox";
import { sandboxApi } from "@/entities/sandbox/api";

export function SandboxPage() {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      sandboxApi
        .getProgress(token)
        .then(setCompletedLevels)
        .catch(console.error);
    }
  }, [token]);

  const selectedLevel = SANDBOX_LEVELS.find((l) => l.id === selectedLevelId);

  const handleLevelSuccess = async (id: string) => {
    if (!completedLevels.includes(id) && token) {
      try {
        await sandboxApi.completeLevel(token, id);
        setCompletedLevels((prev) => [...prev, id]);
        alert(`Поздравляем! Уязвимость на уровне ${id} найдена!`);
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  const resetProgress = async () => {
    if (confirm("Вы уверены, что хотите сбросить весь прогресс?") && token) {
      try {
        await sandboxApi.resetProgress(token);
        setCompletedLevels([]);
      } catch (err) {
        console.error("Failed to reset progress", err);
      }
    }
  };

  if (selectedLevel) {
    const LevelComponent = selectedLevel.component;
    return (
      <LauncherWindow title={selectedLevel.title}>
        <Button
          variant="link"
          onClick={() => setSelectedLevelId(null)}
          style={{ marginBottom: "20px", padding: 0 }}
        >
          ← Назад к списку
        </Button>
        <LevelComponent
          onSuccess={() => handleLevelSuccess(selectedLevel.id)}
        />
      </LauncherWindow>
    );
  }

  return (
    <LauncherWindow title="Песочницы">
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Выберите уровень</h2>
          {completedLevels.length > 0 && (
            <Button
              variant="link"
              onClick={resetProgress}
              style={{ color: "#ff4444" }}
            >
              Сбросить прогресс
            </Button>
          )}
        </div>
        {SANDBOX_LEVELS.map((level) => (
          <div
            key={level.id}
            style={{
              padding: "15px",
              border: "1px solid #eee",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {level.title} {completedLevels.includes(level.id) && "✅"}
              </h3>
              <p style={{ margin: "5px 0 0", color: "#666" }}>
                {level.description}
              </p>
            </div>
            <Button onClick={() => setSelectedLevelId(level.id)}>
              {completedLevels.includes(level.id) ? "Повторить" : "Начать"}
            </Button>
          </div>
        ))}
      </div>
    </LauncherWindow>
  );
}
