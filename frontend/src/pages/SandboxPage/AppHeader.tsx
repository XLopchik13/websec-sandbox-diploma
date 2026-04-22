import { useState, useRef, useEffect } from "react";
import styles from "./AppHeader.module.scss";

interface AppHeaderProps {
  username: string;
  solved: number;
  total: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onHome: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onResetProgress: () => void;
}

export function AppHeader({
  username,
  solved,
  total,
  sidebarOpen,
  onToggleSidebar,
  onHome,
  onLogout,
  onProfile,
  onResetProgress,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Свернуть меню" : "Развернуть меню"}
        >
          <span className={styles.toggleLine} />
          <span className={styles.toggleLine} />
          <span className={styles.toggleLine} />
        </button>
        <button className={styles.logo} onClick={onHome}>
          WEBSEC
        </button>
      </div>

      <div className={styles.right} ref={menuRef}>
        <button
          className={styles.avatar}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {username.slice(0, 2).toUpperCase()}
        </button>

        {menuOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownInfo}>
              <div className={styles.dropdownAvatar}>
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.dropdownMeta}>
                <span className={styles.dropdownName}>{username}</span>
                <span className={styles.dropdownSolved}>
                  Решено: {solved}/{total}
                </span>
              </div>
            </div>
            <div className={styles.dropdownDivider} />
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setMenuOpen(false);
                onProfile();
              }}
            >
              Сменить пароль
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.danger}`}
              onClick={() => {
                setMenuOpen(false);
                onResetProgress();
              }}
            >
              Сбросить прогресс
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.danger}`}
              onClick={onLogout}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
