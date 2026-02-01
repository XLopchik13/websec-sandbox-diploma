import { useAuth } from "@/entities/user/model";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { ProfilePage } from "@/pages/ProfilePage/ProfilePage";

export function App() {
  const { user, loading, error, login, register, logout, deleteAccount } =
    useAuth();

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
  ) => {
    const success = await register(email, username, password);
    if (success) {
      alert("Registration successful. Please login.");
    }
  };

  if (user) {
    return (
      <ProfilePage
        user={user}
        onLogout={logout}
        onDeleteAccount={deleteAccount}
        error={error}
      />
    );
  }

  return (
    <AuthPage
      onLogin={login}
      onRegister={handleRegister}
      loading={loading}
      error={error}
    />
  );
}

export default App;
