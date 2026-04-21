import { Button } from "@/shared/ui/Button/Button";
import type { SandboxLevel } from "@/entities/sandbox/types";
import styles from "./CategoryTheory.module.scss";

const THEORY: Record<string, React.ReactNode> = {
  Инъекции: (
    <>
      <section>
        <h2>XSS — межсайтовый скриптинг</h2>
        <p>
          Уязвимость возникает, когда приложение вставляет пользовательский ввод
          напрямую в HTML без экранирования. Браузер воспринимает вставленный
          код как часть страницы — включая <code>{"<script>"}</code> и
          обработчики событий.
        </p>
        <p>
          <strong>Stored XSS</strong> — код сохраняется на сервере и выполняется
          у каждого, кто откроет страницу. Атака работает без участия жертвы в
          переходе по ссылке. Пример безопасного пейлоада:{" "}
          <code>{'<img src=x onerror="alert(1)">'}</code>.
        </p>
        <p>
          <strong>Защита:</strong> экранирование HTML-символов, использование{" "}
          <code>textContent</code> вместо <code>innerHTML</code>, Content
          Security Policy.
        </p>
      </section>

      <section>
        <h2>SQL Injection</h2>
        <p>
          Уязвимость возникает при конкатенации пользовательского ввода напрямую
          в SQL-запрос. Атакующий завершает строку раньше времени и добавляет
          собственную логику.
        </p>
        <p>
          Запрос{" "}
          <code>{"SELECT * FROM users WHERE name = '" + "' + input + '"}</code>{" "}
          при вводе <code>{"' OR role='admin' --"}</code> превращается в:{" "}
          <code>{"SELECT * FROM users WHERE name='' OR role='admin' --'"}</code>
          . Комментарий <code>--</code> обрывает остаток запроса.
        </p>
        <p>
          <strong>Защита:</strong> параметризованные запросы (prepared
          statements), ORM с bound parameters — никогда не конкатенируйте ввод
          пользователя в SQL строкой.
        </p>
      </section>
    </>
  ),

  "Контроль доступа": (
    <>
      <section>
        <h2>IDOR — небезопасные прямые ссылки на объекты</h2>
        <p>
          Уязвимость возникает, когда объект идентифицируется предсказуемым ID
          (число, UUID), а сервер не проверяет, имеет ли текущий пользователь
          право на доступ именно к этому объекту.
        </p>
        <p>
          Пример: <code>GET /api/profiles/42</code> — если сервер делает{" "}
          <code>SELECT * FROM profiles WHERE id=42</code> без проверки
          владельца, любой авторизованный пользователь получит чужой профиль.
          Достаточно перебрать ID: 1, 2, 3…
        </p>
        <p>
          <strong>Защита:</strong> в каждом запросе сверяйте владельца ресурса с
          текущим пользователем сессии. Используйте непредсказуемые
          идентификаторы (UUID v4) там, где перебор критичен.
        </p>
      </section>
    </>
  ),

  Аутентификация: (
    <>
      <section>
        <h2>JWT и атака alg:none</h2>
        <p>
          JWT (JSON Web Token) состоит из трёх частей, разделённых точкой:{" "}
          <code>header.payload.signature</code>. Каждая часть — это{" "}
          <code>base64url(JSON)</code>. Подпись гарантирует целостность: если
          изменить payload, подпись станет недействительной.
        </p>
        <p>
          <strong>Уязвимость alg:none:</strong> если сервер принимает алгоритм
          подписи из самого заголовка токена без ограничений, атакующий
          выставляет <code>{'"alg": "none"'}</code> и отправляет токен без
          подписи. Сервер пропускает проверку — и принимает изменённый payload.
        </p>
        <p>
          Структура изменённого токена:{" "}
          <code>
            base64url({'"alg":"none"'}).base64url({'"role":"admin"'}).
          </code>{" "}
          (пустая подпись). Декодировать/закодировать части можно прямо в
          DevTools: <code>{"atob(token.split('.')[1])"}</code>.
        </p>
        <p>
          <strong>Защита:</strong> жёстко фиксируйте ожидаемый алгоритм на
          сервере, отклоняйте <code>alg:none</code> и любые неожиданные
          алгоритмы.
        </p>
      </section>
    </>
  ),

  "Прочие уязвимости": (
    <>
      <section>
        <h2>SSRF — подделка серверных запросов</h2>
        <p>
          Уязвимость возникает, когда сервер выполняет HTTP-запрос к URL,
          предоставленному пользователем, без ограничений на допустимые адреса.
          Атакующий направляет сервер на внутренние адреса, недоступные снаружи.
        </p>
        <p>
          Типичные цели: <code>http://localhost/admin</code>,{" "}
          <code>http://169.254.169.254</code> (AWS Instance Metadata),{" "}
          <code>http://10.0.0.1</code> (внутренняя сеть). Сервер делает запрос
          изнутри — там, куда внешний клиент попасть не может.
        </p>
        <p>
          <strong>Защита:</strong> whitelist разрешённых доменов, блокировка
          RFC-1918 диапазонов IP и loopback, запрет перенаправлений на
          внутренние адреса.
        </p>
      </section>
    </>
  ),
};

interface Props {
  category: string;
  levels: SandboxLevel[];
  completedLevels: string[];
  onPractice: (id: string) => void;
  onBack: () => void;
}

export function CategoryTheory({
  category,
  levels,
  completedLevels,
  onPractice,
}: Props) {
  const content = THEORY[category];

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{category} — Теория</h1>

      <div className={styles.theory}>
        {content ?? (
          <p className={styles.placeholder}>
            Теоретический материал будет добавлен позже.
          </p>
        )}
      </div>

      {levels.length > 0 && (
        <div className={styles.levelCards}>
          <h2 className={styles.practiceHeading}>Практические уровни</h2>
          {levels.map((level) => {
            const completed = completedLevels.includes(level.id);
            return (
              <div key={level.id} className={styles.levelCard}>
                <div className={styles.levelCardInfo}>
                  <span className={styles.levelCardTitle}>{level.title}</span>
                  <span className={styles.levelCardDesc}>
                    {level.description}
                  </span>
                </div>
                <Button
                  className={completed ? styles.solvedBtn : styles.practiceBtn}
                  onClick={() => onPractice(level.id)}
                >
                  {completed ? "✓ Решено" : "Перейти к практике"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
