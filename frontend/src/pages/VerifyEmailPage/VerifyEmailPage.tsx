import { useEffect, useState } from "react";
import { userApi } from "@/entities/user/api";
import { useRouter } from "@/shared/router";
import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./VerifyEmailPage.module.scss";

const TOKEN = new URLSearchParams(window.location.search).get("token");

export function VerifyEmailPage() {
  const { navigate } = useRouter();
  const [status, setStatus] = useState<"pending" | "done" | "error">(
    TOKEN ? "pending" : "error",
  );

  useEffect(() => {
    if (!TOKEN) return;
    userApi
      .verifyEmail(TOKEN)
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <LauncherWindow title="Подтверждение почты">
          {status === "pending" && (
            <p className={styles.text}>Проверяем ссылку...</p>
          )}
          {status === "done" && (
            <>
              <div className={styles.icon}>✓</div>
              <p className={styles.text}>Email успешно подтверждён!</p>
              <p className={styles.sub}>Теперь вы можете войти в аккаунт.</p>
              <Button className={styles.btn} onClick={() => navigate("/login")}>
                Войти
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className={`${styles.icon} ${styles.iconError}`}>✕</div>
              <p className={styles.text}>
                Ссылка недействительна или устарела.
              </p>
              <Button
                variant="secondary"
                className={styles.btn}
                onClick={() => navigate("/register")}
              >
                Зарегистрироваться снова
              </Button>
            </>
          )}
        </LauncherWindow>
      </div>
    </div>
  );
}
