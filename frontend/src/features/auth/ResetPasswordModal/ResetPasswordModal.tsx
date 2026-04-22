import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import { userApi } from "@/entities/user/api";
import styles from "./ResetPasswordModal.module.scss";

interface ResetPasswordModalProps {
  token: string;
  onDone: () => void;
}

type Step = "form" | "success";

export function ResetPasswordModal({ token, onDone }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await userApi.resetPassword(token, password);
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка. Возможно, ссылка устарела.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {step === "form" && (
          <>
            <h2 className={styles.title}>Новый пароль</h2>
            <form onSubmit={handleSubmit}>
              <Input
                label="Новый пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Подтвердите пароль"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.actions}>
                <Button type="submit" disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить пароль"}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === "success" && (
          <>
            <h2 className={styles.title}>Пароль изменён</h2>
            <p className={styles.body}>
              Теперь вы можете войти с новым паролем.
            </p>
            <div className={styles.actions}>
              <Button onClick={onDone}>Войти</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
