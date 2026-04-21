import { useAuth } from "@/entities/user/model";
import { AuthPage } from "@/pages/AuthPage/AuthPage";
import { SandboxPage } from "@/pages/SandboxPage/SandboxPage";

export function App() {
  const { user, token, loading, error, login, register, logout } = useAuth();

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

  if (user && token) {
    return <SandboxPage user={user} token={token} onLogout={logout} />;
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
