import styles from "./ProgressBar.module.scss";

interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
