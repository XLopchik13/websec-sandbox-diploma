import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { LEVEL_COMPONENTS } from "@/features/sandbox";
import { sandboxApi } from "@/entities/sandbox/api";
import type { SandboxLevel } from "@/entities/sandbox/types";
import type { User } from "@/entities/user/types";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { CategoryTheory } from "./CategoryTheory";
import styles from "./SandboxPage.module.scss";

type View =
  | { kind: "welcome" }
  | { kind: "theory"; category: string }
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
    setView({ kind: "practice", levelId: id });
  };

  const handleSelectCategory = (category: string) => {
    setView({ kind: "theory", category });
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

  const selectedLevelId = view.kind === "practice" ? view.levelId : null;
  const selectedCategory = view.kind === "theory" ? view.category : null;
  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

  const renderContent = () => {
    if (view.kind === "welcome") {
      return (
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>🔐</div>
          <h2>Добро пожаловать в WEBSEC</h2>
          <p>Выберите тему или уровень в боковой панели, чтобы начать.</p>
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

    if (view.kind === "theory") {
      const categoryLevels = levels.filter((l) => l.category === view.category);
      return (
        <CategoryTheory
          category={view.category}
          levels={categoryLevels}
          completedLevels={completedLevels}
          onPractice={(id) => setView({ kind: "practice", levelId: id })}
          onBack={() => setView({ kind: "welcome" })}
        />
      );
    }

    if (view.kind === "practice" && selectedLevel) {
      const LevelComponent = selectedLevel.component;
      const levelNumber = selectedLevel.id.replace(/\D/g, "");
      return (
        <div className={styles.practiceRow}>
          <div className={styles.practiceMain}>
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
          selectedCategory={selectedCategory}
          onSelectLevel={handleSelectLevel}
          onSelectCategory={handleSelectCategory}
          onResetProgress={handleResetProgress}
          showReset={completedLevels.length > 0}
        />
        <main className={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
}
