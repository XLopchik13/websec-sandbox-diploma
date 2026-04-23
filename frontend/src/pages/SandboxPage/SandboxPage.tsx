import { useState, useEffect, type CSSProperties } from "react";
import { ResetLevelButton } from "@/shared/ui/Button/ResetLevelButton";
import { useRouter } from "@/shared/router";
import { LEVEL_COMPONENTS } from "@/features/sandbox";
import { sandboxApi } from "@/entities/sandbox/api";
import type { SandboxLevel } from "@/entities/sandbox/types";
import type { User } from "@/entities/user/types";
import { ChangePasswordModal } from "@/features/auth/ChangePasswordModal/ChangePasswordModal";
import { Modal } from "@/shared/ui/Modal/Modal";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { CategoryTheory } from "./CategoryTheory";
import styles from "./SandboxPage.module.scss";

const LEVEL_RESET_APIS: Record<string, (token: string) => Promise<unknown>> = {
  "1": (token) => sandboxApi.deleteComments(token, "1"),
  "2": (token) => sandboxApi.sqliReset(token),
  "3": (token) => sandboxApi.idorReset(token),
  "10": (token) => sandboxApi.csrfReset(token),
};

export type SandboxView =
  | { kind: "welcome" }
  | { kind: "theory"; category: string }
  | { kind: "practice"; levelId: string };

interface SandboxPageProps {
  user: User;
  token: string;
  onLogout: () => void;
  view: SandboxView;
}

export function SandboxPage({ user, token, onLogout, view }: SandboxPageProps) {
  const { navigate, replaceRoute } = useRouter();
  const [levels, setLevels] = useState<SandboxLevel[]>([]);
  const [loadedLevelsForToken, setLoadedLevelsForToken] = useState<
    string | null
  >(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [successLevelId, setSuccessLevelId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [progressResetLoading, setProgressResetLoading] = useState(false);

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
      .catch(console.error)
      .finally(() => setLoadedLevelsForToken(token));
    sandboxApi
      .getProgress(token)
      .then(({ completed }) => setCompletedLevels(completed))
      .catch(console.error);
  }, [token]);

  const handleSelectLevel = (id: string) => {
    navigate(`/dashboard/level/${id}`);
  };

  const handleSelectCategory = (category: string) => {
    navigate(`/dashboard/theory/${encodeURIComponent(category)}`);
  };

  const handleLevelReset = async (id: string) => {
    try {
      const resetApi = LEVEL_RESET_APIS[id];
      if (resetApi) await resetApi(token);
    } catch (err) {
      console.error("Failed to reset level backend state", err);
    }
    try {
      await sandboxApi.uncompleteLevel(token, id);
      setCompletedLevels((prev) => prev.filter((l) => l !== id));
    } catch (err) {
      console.error("Failed to uncomplete level", err);
    } finally {
      setResetKey((k) => k + 1);
    }
  };

  const handleLevelSuccess = async (id: string) => {
    if (!completedLevels.includes(id)) {
      try {
        const { completed } = await sandboxApi.completeLevel(token, id);
        setCompletedLevels(completed);
        setSuccessLevelId(id);
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  const handleResetProgress = async () => {
    setProgressResetLoading(true);
    try {
      await sandboxApi.resetProgress(token);
      setCompletedLevels([]);
    } catch (err) {
      console.error("Failed to reset progress", err);
    } finally {
      setProgressResetLoading(false);
      setResetConfirmOpen(false);
    }
  };

  const categories = [...new Set(levels.map((l) => l.category))];

  const selectedLevelId = view.kind === "practice" ? view.levelId : null;
  const selectedCategory = view.kind === "theory" ? view.category : null;
  const levelsLoaded = loadedLevelsForToken === token;
  const selectedLevel = levels.find((l) => l.id === selectedLevelId);
  const categoryLevels =
    view.kind === "theory"
      ? levels.filter((l) => l.category === view.category)
      : [];
  const hasInvalidView =
    (view.kind === "practice" &&
      levelsLoaded &&
      (!selectedLevelId || !selectedLevel)) ||
    (view.kind === "theory" &&
      levelsLoaded &&
      (!selectedCategory || categoryLevels.length === 0));

  useEffect(() => {
    if (hasInvalidView) {
      replaceRoute("/404");
    }
  }, [hasInvalidView, replaceRoute]);

  const renderContent = () => {
    if (view.kind === "welcome") {
      return (
        <div className={styles.welcome}>
          <h2>Добро пожаловать в WEBSEC</h2>
          <p>Выберите тему или уровень в боковой панели, чтобы начать.</p>
        </div>
      );
    }

    if (view.kind === "theory") {
      return (
        <CategoryTheory
          category={view.category}
          levels={categoryLevels}
          completedLevels={completedLevels}
          onPractice={(id) => navigate(`/dashboard/level/${id}`)}
          onBack={() => navigate("/dashboard")}
        />
      );
    }

    if (view.kind === "practice" && selectedLevel) {
      const LevelComponent = selectedLevel.component;
      return (
        <div className={styles.practiceRow}>
          <div className={styles.practiceMain}>
            <LevelComponent
              key={`${selectedLevel.id}-${resetKey}`}
              onSuccess={() => handleLevelSuccess(selectedLevel.id)}
            />
          </div>
          <div className={styles.practiceInfoPanel}>
            <h3>{selectedLevel.title}</h3>
            <p>{selectedLevel.description}</p>
            <ResetLevelButton
              onClick={() => handleLevelReset(selectedLevel.id)}
              className={styles.resetBtn}
            />
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
        onHome={() => navigate("/dashboard")}
        onLogout={onLogout}
        onChangePassword={() => setChangePasswordOpen(true)}
        onResetProgress={() => setResetConfirmOpen(true)}
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
        />
        <main
          className={`${styles.content} ${view.kind === "welcome" || view.kind === "theory" ? styles.centered : ""}`}
          style={
            { "--sidebar-w": sidebarOpen ? "260px" : "0px" } as CSSProperties
          }
        >
          <div
            key={
              view.kind === "practice"
                ? `practice-${view.levelId}`
                : view.kind === "theory"
                  ? `theory-${view.category}`
                  : "welcome"
            }
            className={styles.viewTransition}
          >
            {renderContent()}
          </div>
        </main>
      </div>
      {changePasswordOpen && (
        <ChangePasswordModal
          userEmail={user.email}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}
      {successLevelId && (
        <Modal
          variant="success"
          title="Уязвимость найдена!"
          body="Вы успешно эксплуатировали уязвимость и прошли уровень."
          badge={`Уровень ${successLevelId.replace(/\D/g, "")} пройден`}
          confirmLabel="Продолжить"
          onConfirm={() => setSuccessLevelId(null)}
        />
      )}
      {resetConfirmOpen && (
        <Modal
          variant="danger"
          title="Сбросить прогресс?"
          body="Все пройденные уровни будут отмечены как непройденные. Это действие нельзя отменить."
          confirmLabel="Сбросить"
          cancelLabel="Отмена"
          loading={progressResetLoading}
          onConfirm={handleResetProgress}
          onCancel={() => setResetConfirmOpen(false)}
        />
      )}
    </div>
  );
}
