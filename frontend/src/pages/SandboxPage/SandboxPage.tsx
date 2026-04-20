import { useState, useEffect } from "react";
import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { Button } from "@/shared/ui/Button/Button";
import { LEVEL_COMPONENTS } from "@/features/sandbox";
import { sandboxApi } from "@/entities/sandbox/api";
import type { SandboxLevel } from "@/entities/sandbox/types";

export function SandboxPage() {
  const [levels, setLevels] = useState<SandboxLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    sandboxApi
      .getLevels(token)
      .then((meta) =>
        setLevels(
          meta
            .filter((m) => LEVEL_COMPONENTS[m.id])
            .map((m) => ({ ...m, component: LEVEL_COMPONENTS[m.id] })),
        ),
      )
      .catch(console.error);
    sandboxApi
      .getProgress(token)
      .then(({ completed }) => setCompletedLevels(completed))
      .catch(console.error);
  }, [token]);

  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

  const handleLevelSuccess = async (id: string) => {
    if (!completedLevels.includes(id) && token) {
      try {
        const { completed } = await sandboxApi.completeLevel(token, id);
        setCompletedLevels(completed);
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
      <LauncherWindow title={selectedLevel.title} wide>
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

  const categories = [...new Set(levels.map((l) => l.category))];

  return (
    <LauncherWindow title="Песочницы" wide>
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

        {categories.map((category) => (
          <div key={category}>
            <h3
              style={{
                margin: "10px 0 8px",
                color: "#555",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {category}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {levels
                .filter((l) => l.category === category)
                .map((level) => (
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
                        {level.title}{" "}
                        {completedLevels.includes(level.id) && "✅"}
                      </h3>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        {level.description}
                      </p>
                    </div>
                    <Button onClick={() => setSelectedLevelId(level.id)}>
                      {completedLevels.includes(level.id)
                        ? "Повторить"
                        : "Начать"}
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </LauncherWindow>
  );
}
