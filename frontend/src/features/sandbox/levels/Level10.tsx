import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/Button/Button";
import { BrowserWindow } from "@/shared/ui/BrowserWindow/BrowserWindow";
import { sandboxApi } from "@/entities/sandbox/api";
import styles from "./Level10.module.scss";

interface LevelProps {
  onSuccess: () => void;
}

const BANK_NAVBAR = [
  { label: "Счёт", active: true },
  { label: "Переводы" },
  { label: "История" },
  { label: "Выход" },
];

export function Level10({ onSuccess }: LevelProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [lastTransfer, setLastTransfer] = useState<{
    to: string;
    amount: number;
  } | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [attacked, setAttacked] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMsg, setTransferMsg] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const token = localStorage.getItem("token")!;

  const loadAccount = async () => {
    const data = await sandboxApi.csrfGetAccount(token);
    setBalance(data.balance);
    if (data.last_transfer_to) {
      setLastTransfer({
        to: data.last_transfer_to,
        amount: data.last_transfer_amount ?? 0,
      });
    }
  };

  useEffect(() => {
    loadAccount().catch(console.error);
  }, [token]);

  const handleCsrfAttack = async () => {
    setAttacking(true);
    try {
      const data = await sandboxApi.csrfTransfer(
        token,
        500,
        "attacker@evil.io",
      );
      setBalance(data.balance);
      setLastTransfer({ to: "attacker@evil.io", amount: 500 });
      setAttacked(true);
      onSuccess();
    } finally {
      setAttacking(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(transferAmount, 10);
    if (!transferTo.trim() || isNaN(amount) || amount <= 0) return;
    setTransferLoading(true);
    setTransferMsg(null);
    try {
      const data = await sandboxApi.csrfTransfer(
        token,
        amount,
        transferTo.trim(),
      );
      setBalance(data.balance);
      setLastTransfer({ to: transferTo.trim(), amount });
      setTransferMsg(data.message);
      setTransferTo("");
      setTransferAmount("");
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.browserRow}>
        <div className={styles.browserCol}>
          <BrowserWindow
            url="bank.websec-internal.io/account"
            appName="WebSecBank"
            appColor="#1d4ed8"
            navbar={BANK_NAVBAR}
          >
            <div
              style={{
                background: "#f8fafc",
                minHeight: "420px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Добро пожаловать, клиент
              </div>
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>Текущий баланс</div>
                <div
                  className={styles.balanceValue}
                  style={{
                    color:
                      balance !== null && balance < 1000
                        ? "#dc2626"
                        : "#16a34a",
                  }}
                >
                  {balance !== null ? `${balance} ₽` : "..."}
                </div>
              </div>
              {lastTransfer && (
                <div className={styles.transferAlert}>
                  ⚠ Последний перевод: <strong>{lastTransfer.amount} ₽</strong>{" "}
                  → <code>{lastTransfer.to}</code>
                </div>
              )}
              <div
                style={{
                  marginTop: "20px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0f172a",
                    marginBottom: "12px",
                  }}
                >
                  Перевод средств
                </div>
                <form
                  onSubmit={handleTransfer}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <input
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="Получатель (email или счёт)"
                    className={styles.transferInput}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Сумма ₽"
                      min="1"
                      className={styles.transferInput}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="submit"
                      disabled={
                        transferLoading || !transferTo.trim() || !transferAmount
                      }
                      className={styles.transferBtn}
                    >
                      {transferLoading ? "..." : "Перевести"}
                    </Button>
                  </div>
                </form>
                {transferMsg && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#16a34a",
                    }}
                  >
                    ✓ {transferMsg}
                  </div>
                )}
              </div>
            </div>
          </BrowserWindow>
        </div>

        <div className={styles.browserCol}>
          <BrowserWindow url="totally-not-a-scam.io/prize">
            <div
              style={{
                background: "#fff9c4",
                minHeight: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                textAlign: "center",
              }}
            >
              {!attacked ? (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>
                    🎉
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#92400e",
                      marginBottom: "8px",
                    }}
                  >
                    Вы выиграли приз!
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#78350f",
                      marginBottom: "24px",
                      maxWidth: "240px",
                    }}
                  >
                    Нажмите кнопку для получения вашего бесплатного подарка.
                    Никаких скрытых условий!
                  </div>
                  <div className={styles.hiddenFormNote}>
                    {`<!-- hidden CSRF form -->`}
                    <br />
                    {`<form action="bank.websec-internal.io/transfer" method="POST">`}
                    <br />
                    {`  <input name="amount" value="500">`}
                    <br />
                    {`  <input name="to" value="attacker@evil.io">`}
                    <br />
                    {`</form>`}
                  </div>
                  <Button
                    onClick={handleCsrfAttack}
                    disabled={attacking}
                    className={styles.claimBtn}
                  >
                    {attacking ? "..." : "🎁 Получить приз"}
                  </Button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>
                    ✅
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#166534",
                      marginBottom: "8px",
                    }}
                  >
                    Атака выполнена!
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    500 ₽ переведены на <code>attacker@evil.io</code> без ведома
                    пользователя.
                    <br />
                    Запрос прошёл, потому что токен аутентификации был доступен.
                  </div>
                </>
              )}
            </div>
          </BrowserWindow>
        </div>
      </div>
    </div>
  );
}
