import type { ReactNode } from "react";
import styles from "./LauncherWindow.module.scss";

interface LauncherWindowProps {
  title: string;
  children: ReactNode;
  error?: string | null;
}

export function LauncherWindow({
  title,
  children,
  error,
}: LauncherWindowProps) {
  return (
    <div className={styles.window}>
      <h1 className={styles.title}>{title}</h1>
      {error && <div className={styles.error}>{error}</div>}
      {children}
    </div>
  );
}
