import { LauncherWindow } from "@/shared/ui/LauncherWindow/LauncherWindow";
import { UserProfile } from "@/features/profile/UserProfile/UserProfile";
import type { User } from "@/entities/user/types";

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => void;
  error: string | null;
}

export function ProfilePage({
  user,
  onLogout,
  onDeleteAccount,
  error,
}: ProfilePageProps) {
  return (
    <LauncherWindow title="User Profile" error={error}>
      <UserProfile
        user={user}
        onLogout={onLogout}
        onDeleteAccount={onDeleteAccount}
      />
    </LauncherWindow>
  );
}
