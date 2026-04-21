import styles from "./Sidebar.module.scss";
import type { SandboxLevel } from "@/entities/sandbox/types";

interface SidebarProps {
  open: boolean;
  categories: string[];
  levels: SandboxLevel[];
  completedLevels: string[];
  selectedLevelId: string | null;
  onSelectLevel: (id: string) => void;
  onResetProgress: () => void;
  showReset: boolean;
}

export function Sidebar({
  open,
  categories,
  levels,
  completedLevels,
  selectedLevelId,
  onSelectLevel,
  onResetProgress,
  showReset,
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${open ? "" : styles.closed}`}>
      <nav className={styles.nav}>
        {categories.map((category) => (
          <div key={category} className={styles.group}>
            <div className={styles.groupHeader}>{category}</div>
            {levels
              .filter((l) => l.category === category)
              .map((level) => (
                <button
                  key={level.id}
                  className={`${styles.levelItem} ${selectedLevelId === level.id ? styles.active : ""}`}
                  onClick={() => onSelectLevel(level.id)}
                >
                  {level.title}
                </button>
              ))}
          </div>
        ))}
      </nav>

      {showReset && (
        <div className={styles.footer}>
          <button className={styles.resetBtn} onClick={onResetProgress}>
            Сбросить прогресс
          </button>
        </div>
      )}
    </aside>
  );
}
