import { useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import { sandboxApi } from "@/entities/sandbox/api";

interface LevelProps {
  onSuccess: () => void;
}

interface Account {
  id: number;
  username: string;
  role: string;
}

export function Level2({ onSuccess }: LevelProps) {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<Account[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !username.trim()) return;

    setLoading(true);
    try {
      const data = await sandboxApi.sqliSearch(token, username);
      setResults(data);
      setSearched(true);

      // Победа: в результатах появился admin
      if (data.some((r) => r.role === "admin")) {
        onSuccess();
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    setResetLoading(true);
    try {
      await sandboxApi.sqliReset(token);
      setResults([]);
      setSearched(false);
      setUsername("");
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      <h3>Уровень 2: SQL Injection</h3>
      <p>
        Форма поиска пользователей по имени. Запрос к базе данных формируется
        через конкатенацию строк — без параметризации.
      </p>
      <p>
        Цель: получить запись с ролью <code>admin</code>, которая не должна
        появляться при обычном поиске.
      </p>
      <p>
        Подсказка: попробуйте завершить строку и добавить условие, например{" "}
        <code>{"' OR role='admin' --"}</code>
      </p>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <Input
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Введите имя..."
          disabled={loading}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Поиск..." : "Найти"}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleReset}
            disabled={resetLoading}
          >
            {resetLoading ? "Сброс..." : "Сбросить данные"}
          </Button>
        </div>
      </form>

      {searched && (
        <div style={{ marginTop: "20px" }}>
          <h4>Результаты поиска:</h4>
          {results.length === 0 ? (
            <p style={{ color: "#666" }}>Ничего не найдено</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Username
                  </th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      background:
                        r.role === "admin" ? "#fff3cd" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px" }}>{r.id}</td>
                    <td style={{ padding: "8px" }}>{r.username}</td>
                    <td style={{ padding: "8px" }}>{r.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
