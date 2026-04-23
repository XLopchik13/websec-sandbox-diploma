import { useEffect } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
  variant: "success" | "danger";
  title: string;
  body: string;
  badge?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function Modal({
  variant,
  title,
  body,
  badge,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ModalProps) {
  const handleClose = onCancel ?? onConfirm;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.icon} ${styles[variant]}`}>
          <svg className={styles.iconSvg} viewBox="0 0 24 24">
            {variant === "success" ? (
              <path className={styles.checkPath} d="M4 12.5l5 5 11-11" />
            ) : (
              <path className={styles.checkPath} d="M12 7v5.5M12 16v1" />
            )}
          </svg>
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>

        {badge && <div className={styles.badge}>{badge}</div>}

        <div className={styles.actions}>
          <button
            className={`${styles.btnConfirm} ${styles[variant]}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          {cancelLabel && (
            <button className={styles.btnCancel} onClick={handleClose}>
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
