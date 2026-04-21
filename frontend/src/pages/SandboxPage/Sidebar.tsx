import styles from "./Sidebar.module.scss";
import type { SandboxLevel } from "@/entities/sandbox/types";

interface SidebarProps {
  open: boolean;
  categories: string[];
  levels: SandboxLevel[];
  completedLevels: string[];
  selectedLevelId: string | null;
  selectedCategory: string | null;
  onSelectLevel: (id: string) => void;
  onSelectCategory: (category: string) => void;
}

export function Sidebar({
  open,
  categories,
  levels,
  completedLevels,
  selectedLevelId,
  selectedCategory,
  onSelectLevel,
  onSelectCategory,
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${open ? "" : styles.closed}`}>
      <nav className={styles.nav}>
        {categories.map((category) => (
          <div key={category} className={styles.group}>
            <button
              className={`${styles.groupHeader} ${selectedCategory === category ? styles.activeCategory : ""}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
            {levels
              .filter((l) => l.category === category)
              .map((level) => (
                <button
                  key={level.id}
                  className={`${styles.levelItem} ${selectedLevelId === level.id ? styles.active : ""} ${completedLevels.includes(level.id) ? styles.completed : ""}`}
                  onClick={() => onSelectLevel(level.id)}
                >
                  {level.title}
                </button>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
