import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { LEVEL_COMPONENTS } from "@/features/sandbox";
import { sandboxApi } from "@/entities/sandbox/api";
import type { SandboxLevel } from "@/entities/sandbox/types";
import type { User } from "@/entities/user/types";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import styles from "./SandboxPage.module.scss";

type View =
  | { kind: "welcome" }
  | { kind: "overview"; levelId: string }
  | { kind: "theory"; levelId: string }
  | { kind: "practice"; levelId: string }
  | { kind: "profile" };

interface SandboxPageProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export function SandboxPage({ user, token, onLogout }: SandboxPageProps) {
  const [levels, setLevels] = useState<SandboxLevel[]>([]);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [view, setView] = useState<View>({ kind: "welcome" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
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

  const handleSelectLevel = (id: string) => {
    setView({ kind: "overview", levelId: id });
  };

  const handleLevelSuccess = async (id: string) => {
    if (!completedLevels.includes(id)) {
      try {
        const { completed } = await sandboxApi.completeLevel(token, id);
        setCompletedLevels(completed);
        alert(`Поздравляем! Уязвимость на уровне ${id} найдена!`);
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  const handleResetProgress = async () => {
    if (confirm("Сбросить весь прогресс?")) {
      try {
        await sandboxApi.resetProgress(token);
        setCompletedLevels([]);
      } catch (err) {
        console.error("Failed to reset progress", err);
      }
    }
  };

  const categories = [...new Set(levels.map((l) => l.category))];

  const selectedLevelId =
    view.kind !== "welcome" && view.kind !== "profile" ? view.levelId : null;
  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

  const renderContent = () => {
    if (view.kind === "welcome") {
      return (
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>🔐</div>
          <h2>Добро пожаловать в WEBSEC</h2>
          <p>Выберите уровень в боковой панели, чтобы начать.</p>
        </div>
      );
    }

    if (view.kind === "profile") {
      return (
        <div className={styles.profileView}>
          <h2>Профиль</h2>
          <div className={styles.profileCard}>
            <p>
              <strong>Имя пользователя:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
          <div className={styles.profileSection}>
            <h3>Изменить пароль</h3>
            <p className={styles.comingSoon}>Функция в разработке.</p>
          </div>
        </div>
      );
    }

    if (!selectedLevel) return null;

    if (view.kind === "overview") {
      const completed = completedLevels.includes(selectedLevel.id);
      return (
        <div className={styles.overview}>
          <div className={styles.overviewMeta}>
            <span className={styles.overviewCategory}>
              {selectedLevel.category}
            </span>
            {completed && (
              <span className={styles.completedBadge}>✓ Решено</span>
            )}
          </div>
          <h1 className={styles.overviewTitle}>{selectedLevel.title}</h1>
          <p className={styles.overviewDesc}>{selectedLevel.description}</p>
          <div className={styles.overviewActions}>
            <Button
              variant="ghost"
              className={styles.theoryBtn}
              onClick={() =>
                setView({ kind: "theory", levelId: selectedLevel.id })
              }
            >
              Теория
            </Button>
            <Button
              className={styles.practiceBtn}
              onClick={() =>
                setView({ kind: "practice", levelId: selectedLevel.id })
              }
            >
              Практика
            </Button>
          </div>
        </div>
      );
    }

    if (view.kind === "theory") {
      return (
        <div className={styles.theoryContent}>
          <Button
            variant="link"
            className={styles.backBtn}
            onClick={() =>
              setView({ kind: "overview", levelId: selectedLevel.id })
            }
          >
            Назад
          </Button>
          <h1>{selectedLevel.title} — Теория</h1>
          <div className={styles.markdownArea}>
            <p className={styles.placeholder}>
              Теоретический материал будет добавлен позже.
            </p>
          </div>
        </div>
      );
    }

    if (view.kind === "practice") {
      const LevelComponent = selectedLevel.component;
      const levelNumber = selectedLevel.id.replace(/\D/g, "");
      return (
        <div className={styles.practiceView}>
          <div className={styles.practiceMain}>
            <Button
              variant="link"
              className={styles.backBtn}
              onClick={() =>
                setView({ kind: "overview", levelId: selectedLevel.id })
              }
            >
              Назад
            </Button>
            <LevelComponent
              onSuccess={() => handleLevelSuccess(selectedLevel.id)}
            />
          </div>
          <div className={styles.practiceInfoPanel}>
            <h3>
              {levelNumber ? `Уровень ${levelNumber}: ` : ""}
              {selectedLevel.title}
            </h3>
            <p>{selectedLevel.description}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.root}>
      <AppHeader
        username={user.username}
        solved={completedLevels.length}
        total={levels.length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onLogout={onLogout}
        onProfile={() => setView({ kind: "profile" })}
      />
      <div className={styles.body}>
        <Sidebar
          open={sidebarOpen}
          categories={categories}
          levels={levels}
          completedLevels={completedLevels}
          selectedLevelId={selectedLevelId}
          onSelectLevel={handleSelectLevel}
          onResetProgress={handleResetProgress}
          showReset={completedLevels.length > 0}
        />
        <main className={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
}
