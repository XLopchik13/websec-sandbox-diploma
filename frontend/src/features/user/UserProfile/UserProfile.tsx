import { Button } from "../../../components/ui/Button/Button";
import styles from "./UserProfile.module.scss";

interface User {
  id: number;
  email: string;
  username: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function UserProfile({
  user,
  onLogout,
  onDeleteAccount,
}: UserProfileProps) {
  return (
    <div>
      <h2 className={styles.heading}>Welcome!</h2>

      <div className={styles.infoBox}>
        <p className={styles.infoLine}>
          <strong className={styles.label}>Username:</strong> {user.username}
        </p>
        <p className={styles.infoLine}>
          <strong className={styles.label}>Email:</strong> {user.email}
        </p>
        <p className={styles.infoLine}>
          <strong className={styles.label}>ID:</strong> {user.id}
        </p>
      </div>

      <div className={styles.actions}>
        <Button onClick={onLogout} className={styles.actionBtn}>
          Logout
        </Button>
        <Button
          variant="danger"
          onClick={onDeleteAccount}
          className={styles.actionBtn}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
