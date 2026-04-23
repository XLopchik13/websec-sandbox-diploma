import { useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./Modal.module.scss";

interface ModalProps {
  variant: "success" | "danger";
  title: string;
  body: string;
  badge?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
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
  loading = false,
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
    <div
      className={styles.backdrop}
      onClick={loading ? undefined : handleClose}
    >
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
          <Button
            variant={variant === "success" ? "primary" : "danger"}
            loading={loading}
            onClick={onConfirm}
            className={styles.btnConfirm}
          >
            {confirmLabel}
          </Button>
          {cancelLabel && (
            <button
              className={styles.btnCancel}
              disabled={loading}
              onClick={handleClose}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
