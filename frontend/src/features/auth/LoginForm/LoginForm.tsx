import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import styles from "./LoginForm.module.scss";

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => void;
  onSwitchToRegister: () => void;
  disabled?: boolean;
}

export function LoginForm({
  onSubmit,
  onSwitchToRegister,
  disabled,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={disabled}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={disabled}
      />

      <Button type="submit" disabled={disabled} className={styles.submitButton}>
        Войти
      </Button>

      <div className={styles.switchLink}>
        Нет аккаунта?{" "}
        <Button type="button" variant="link" onClick={onSwitchToRegister}>
          Зарегистрироваться
        </Button>
      </div>
    </form>
  );
}
