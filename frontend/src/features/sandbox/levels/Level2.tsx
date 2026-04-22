import { useState, useEffect } from "react";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import searchIcon from "@/assets/search.svg";
import styles from "./Level2.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

interface Account {
  id: number;
  username: string;
  role: string;
}

const NAVBAR = [
  { label: "Главная" },
  { label: "Сотрудники", active: true },
  { label: "Отделы" },
  { label: "Отчёты" },
];

const badgeClass: Record<string, string> = {
  admin: styles.badgeAdmin,
  moderator: styles.badgeModerator,
  user: styles.badgeUser,
};

export function Level2({ onSuccess }: LevelProps) {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<Account[]>([]);
  const [dbError, setDbError] = useState(false);
  const [searched, setSearched] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    sandboxApi.sqliEmployees(token).then((data) => {
      setResults(data);
      setSearched(true);
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!username.trim()) {
      sandboxApi.sqliEmployees(token).then((data) => setResults(data));
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await sandboxApi.sqliSearch(token, username);
        setDbError(false);
        setResults(data);
        const isCompleteInjection =
          /['"]/.test(username) && /(--|#)/.test(username);
        if (isCompleteInjection && data.some((r) => r.role === "admin"))
          onSuccess();
      } catch {
        setDbError(true);
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [username, token, onSuccess]);

  return (
    <div className={styles.wrapper}>
      <BrowserWindow
        url="hr.corp-internal.io/employees/search"
        appName="HR Portal"
        appColor="#2563eb"
        navbar={NAVBAR}
      >
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <div className={styles.pageTitle}>База сотрудников</div>
              <div className={styles.pageSubtitle}>
                Поиск по имени пользователя
              </div>
            </div>
          </div>

          <div className={styles.searchBox}>
            <img src={searchIcon} className={styles.searchIcon} alt="" />
            <input
              className={styles.searchInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Поиск по имени сотрудника..."
            />
          </div>

          {searched && (
            <div className={styles.resultsBox}>
              <div className={styles.resultsHeader}>
                {dbError ? "Ошибка запроса" : `Найдено: ${results.length}`}
              </div>
              {dbError ? (
                <div className={styles.dbError}>500 Internal Server Error</div>
              ) : results.length === 0 ? (
                <div className={styles.empty}>Сотрудники не найдены</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {["ID", "Имя пользователя", "Роль"].map((h) => (
                        <th key={h} className={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className={styles.tr}>
                        <td className={styles.cellId}>{r.id}</td>
                        <td className={styles.cellName}>{r.username}</td>
                        <td className={styles.cellRole}>
                          <span
                            className={`${styles.badge} ${badgeClass[r.role] ?? styles.badgeUser}`}
                          >
                            {r.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </BrowserWindow>
    </div>
  );
}
