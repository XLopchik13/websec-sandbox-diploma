import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";

interface LevelProps {
  onSuccess: () => void;
}

interface Profile {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  secret_note: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#dc3545", text: "#fff" },
  moderator: { bg: "#fd7e14", text: "#fff" },
  user: { bg: "#0d6efd", text: "#fff" },
};

const AVATAR_COLORS = ["#6f42c1", "#0d6efd", "#198754", "#fd7e14", "#dc3545"];

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function EmployeeCard({ profile }: { profile: Profile }) {
  const role = ROLE_COLORS[profile.role] ?? { bg: "#6c757d", text: "#fff" };
  const avatarColor = AVATAR_COLORS[profile.id % AVATAR_COLORS.length];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)",
          padding: "28px 24px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "700",
            color: "#fff",
            flexShrink: 0,
            border: "3px solid rgba(255,255,255,0.3)",
          }}
        >
          {getInitials(profile.username)}
        </div>
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "6px",
            }}
          >
            {profile.username}
          </div>
          <span
            style={{
              background: role.bg,
              color: role.text,
              padding: "2px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {profile.role}
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            color: "rgba(255,255,255,0.5)",
            fontSize: "13px",
          }}
        >
          ID: {profile.id}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>✉️</span>
            <span style={{ color: "#555", fontSize: "14px" }}>
              {profile.email}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>📱</span>
            <span style={{ color: "#555", fontSize: "14px" }}>
              {profile.phone}
            </span>
          </div>
          <div
            style={{
              marginTop: "8px",
              padding: "12px 14px",
              background: "#f8f9fa",
              borderRadius: "8px",
              borderLeft: "3px solid #dee2e6",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "6px",
              }}
            >
              Личные заметки
            </div>
            <div style={{ fontSize: "14px", color: "#333" }}>
              {profile.secret_note}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Level3({ onSuccess }: LevelProps) {
  const [currentId, setCurrentId] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(
    async (id: number) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const data = await sandboxApi.idorGetProfile(token, id);
        setProfile(data);
        setCurrentId(id);
        if (data.role === "admin") onSuccess();
      } catch {
        setError(`Профиль #${id} не найден`);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    },
    [token, onSuccess],
  );

  useEffect(() => {
    if (!token) return;
    sandboxApi
      .idorMyProfile(token)
      .then((p) => {
        setProfile(p);
        setCurrentId(p.id);
      })
      .catch(() => fetchProfile(1));
  }, [token, fetchProfile]);

  const handleReset = async () => {
    if (!token) return;
    setResetLoading(true);
    try {
      await sandboxApi.idorReset(token);
      await sandboxApi.idorMyProfile(token).then((p) => {
        setProfile(p);
        setCurrentId(p.id);
        setError("");
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleNavigate = (url: string) => {
    const match = url.match(/\/(\d+)\s*$/);
    if (match) fetchProfile(parseInt(match[1], 10));
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <BrowserWindow
          url={`corp-portal.internal/employees/${currentId}`}
          onNavigate={handleNavigate}
        >
          <div
            style={{
              background: "#f0f2f5",
              padding: "20px",
              minHeight: "200px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                marginBottom: "12px",
                fontFamily: "monospace",
              }}
            >
              GET /api/employees/{currentId} → 200 OK
            </div>

            {loading && (
              <div
                style={{
                  color: "#888",
                  textAlign: "center",
                  paddingTop: "40px",
                }}
              >
                Загрузка...
              </div>
            )}
            {error && !loading && (
              <div
                style={{
                  color: "#dc3545",
                  background: "#fff5f5",
                  border: "1px solid #f5c2c7",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "14px",
                }}
              >
                404 — {error}
              </div>
            )}
            {profile && !loading && <EmployeeCard profile={profile} />}
          </div>
        </BrowserWindow>
      </div>

      <Button variant="danger" onClick={handleReset} disabled={resetLoading}>
        {resetLoading ? "Сброс..." : "Сбросить данные"}
      </Button>
    </div>
  );
}
