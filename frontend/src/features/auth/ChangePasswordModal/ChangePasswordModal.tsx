import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { userApi } from "@/entities/user/api";
import styles from "./ChangePasswordModal.module.scss";

interface ChangePasswordModalProps {
  userEmail: string;
  onClose: () => void;
}

type Step = "confirm" | "sent";

export function ChangePasswordModal({
  userEmail,
  onClose,
}: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await userApi.requestPasswordReset(userEmail);
      setStep("sent");
    } catch {
      setError("Не удалось отправить письмо. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {step === "confirm" && (
          <>
            <h2 className={styles.title}>Смена пароля</h2>
            <p className={styles.body}>
              Мы отправим письмо со ссылкой для смены пароля на&nbsp;
              <strong>{userEmail}</strong>.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Отмена
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                {loading ? "Отправка..." : "Отправить письмо"}
              </Button>
            </div>
          </>
        )}

        {step === "sent" && (
          <>
            <h2 className={styles.title}>Письмо отправлено</h2>
            <p className={styles.body}>
              Перейдите по ссылке в письме, чтобы задать новый пароль. Ссылка
              действительна 1 час.
            </p>
            <div className={styles.actions}>
              <Button onClick={onClose}>Закрыть</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
