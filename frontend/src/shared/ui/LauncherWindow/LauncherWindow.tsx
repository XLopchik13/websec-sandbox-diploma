import type { ReactNode } from "react";
import styles from "./LauncherWindow.module.scss";

interface LauncherWindowProps {
  title: string;
  children: ReactNode;
  error?: string | null;
  success?: string | null;
  wide?: boolean;
}

export function LauncherWindow({
  title,
  children,
  error,
  success,
  wide,
}: LauncherWindowProps) {
  return (
    <div className={`${styles.window}${wide ? ` ${styles.wide}` : ""}`}>
      <h1 className={styles.title}>{title}</h1>
      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}
      {children}
    </div>
  );
}
