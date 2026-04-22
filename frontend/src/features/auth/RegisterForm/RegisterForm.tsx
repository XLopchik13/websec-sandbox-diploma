import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import styles from "./RegisterForm.module.scss";

interface RegisterFormProps {
  onSubmit: (email: string, username: string, pass: string) => void;
  onSwitchToLogin: () => void;
  disabled?: boolean;
}

export function RegisterForm({
  onSubmit,
  onSwitchToLogin,
  disabled,
}: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, username, password);
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
        label="Имя пользователя"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
        Зарегистрироваться
      </Button>

      <div className={styles.switchLink}>
        Уже есть аккаунт?{" "}
        <Button type="button" variant="link" onClick={onSwitchToLogin}>
          Войти
        </Button>
      </div>
    </form>
  );
}
