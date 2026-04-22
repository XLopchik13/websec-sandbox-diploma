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

  Конфигурация: (
    <>
      <section>
        <h2>Security Misconfiguration — небезопасная конфигурация</h2>
        <p>
          Одна из самых распространённых уязвимостей: приложение или
          инфраструктура развёрнуты с небезопасными настройками по умолчанию.
          Сюда входят заводские пароли, открытые отладочные эндпоинты, лишние
          права доступа, раскрытие версий ПО в заголовках ответа.
        </p>
        <p>
          Типичный пример — <strong>учётные данные по умолчанию</strong>:{" "}
          <code>admin:admin</code>, <code>admin:password</code>,{" "}
          <code>root:root</code>. Производители оборудования и ПО поставляют
          системы с такими кредами, которые операторы забывают сменить.
        </p>
        <p>
          <strong>Защита:</strong> смена всех заводских паролей при
          развёртывании, отключение отладочных режимов в продакшне, регулярный
          аудит конфигурации, принцип минимальных привилегий.
        </p>
      </section>
    </>
  ),

  Криптография: (
    <>
      <section>
        <h2>Cryptographic Failures — слабая криптография</h2>
        <p>
          Уязвимость возникает при использовании устаревших или неподходящих
          криптографических алгоритмов. MD5 и SHA-1 были скомпрометированы:
          существуют огромные таблицы предвычисленных хешей (rainbow tables),
          которые позволяют мгновенно восстановить исходное значение по хешу.
        </p>
        <p>
          <strong>Проблема MD5 для паролей:</strong> алгоритм быстрый — можно
          перебирать миллиарды вариантов в секунду. Без соли (<em>salt</em>)
          одинаковые пароли дают одинаковые хеши, что делает атаку по словарю
          тривиальной. Хеш <code>5f4dcc3b5aa765d61d8327deb882cf99</code> — это
          MD5 от слова <code>password</code>, он известен любому, кто погуглил
          «md5 rainbow table».
        </p>
        <p>
          <strong>Защита:</strong> использовать специализированные алгоритмы для
          паролей — bcrypt, scrypt, Argon2. Они медленные по дизайну и
          поддерживают соль, что делает перебор нерентабельным.
        </p>
      </section>
    </>
  ),

  "Целостность данных": (
    <>
      <section>
        <h2>CSRF — межсайтовая подделка запросов</h2>
        <p>
          Атака заставляет браузер жертвы выполнить нежелательное действие на
          сайте, где жертва аутентифицирована. Браузер автоматически добавляет
          cookies к каждому запросу — атакующий использует это, чтобы действие
          выглядело легитимным.
        </p>
        <p>
          Сценарий: жертва залогинена в банк, открывает вредоносную страницу. На
          ней скрытая форма с{" "}
          <code>{'<form action="bank.io/transfer" method="POST">'}</code>. Форма
          отправляется автоматически — и банк получает запрос с валидной сессией
          жертвы. Банк не может отличить его от легитимного.
        </p>
        <p>
          <strong>Защита:</strong> CSRF-токены (случайное значение в форме,
          которое должен знать только легитимный сайт),{" "}
          <code>SameSite=Strict</code> на сессионных cookies, проверка заголовка{" "}
          <code>Origin</code> / <code>Referer</code>.
        </p>
      </section>
    </>
  ),

  "Цепочка поставок": (
    <>
      <section>
        <h2>Supply Chain Failures</h2>
        <p>
          Атаки на цепочку поставок направлены не на само приложение, а на его
          зависимости: сторонние библиотеки, CI/CD-инструменты, контейнерные
          образы, SDK. Компрометация одного пакета позволяет атакующему
          выполнить код в тысячах проектов одновременно.
        </p>
        <p>
          Громкие примеры: <strong>SolarWinds (2020)</strong> — бэкдор в
          обновлении ПО; <strong>event-stream (2018)</strong> — вредоносный код
          добавлен в npm-пакет с 2M загрузок/нед.;{" "}
          <strong>XZ Utils (2024)</strong> — двухлетняя операция по внедрению
          бэкдора в системную библиотеку Linux.
        </p>
      </section>

      <section>
        <h2>Typosquatting</h2>
        <p>
          Атакующий публикует пакет с именем, похожим на популярный:{" "}
          <code>chart-lib</code> → <code>chartlib</code>, <code>lodash</code> →{" "}
          <code>1odash</code>. Разработчик допускает опечатку при вводе имени —
          и получает вредоносный пакет вместо настоящего.
        </p>
        <p>
          Вредоносный код, как правило, находится в <code>postinstall</code>
          -скрипте, который npm запускает автоматически сразу после установки. К
          этому моменту код уже выполнился — до того, как разработчик успел
          что-то заметить.
        </p>
        <p>
          <strong>Типичный payload</strong> — сбор переменных окружения
          (DATABASE_URL, API_SECRET, AWS_ACCESS_KEY_ID) и их отправка на сервер
          атакующего. В CI/CD-среде это означает компрометацию
          production-credentials.
        </p>
      </section>

      <section>
        <h2>Dependency Confusion</h2>
        <p>
          Атакующий публикует пакет на <em>публичном</em> реестре с тем же
          именем, что у внутреннего пакета компании. Если менеджер пакетов
          настроен проверять публичный реестр с более высоким приоритетом —
          будет установлена вредоносная версия. Атака сработала на Microsoft,
          Apple, PayPal в 2021 году.
        </p>
      </section>

      <section>
        <h2>Защита</h2>
        <p>
          <strong>Subresource Integrity (SRI)</strong> — хеш ресурса в атрибуте{" "}
          <code>integrity</code> тега <code>{"<script>"}</code>: браузер
          блокирует загрузку, если хеш не совпадает.
        </p>
        <p>
          <strong>lock-файлы</strong> (<code>package-lock.json</code>,{" "}
          <code>yarn.lock</code>) — фиксируют точные версии и хеши всего дерева
          зависимостей. Без lock-файла <code>^3.2.1</code> может поставить 3.3.0
          с бэкдором.
        </p>
        <p>
          <strong>Аудит</strong>: <code>npm audit</code>,{" "}
          <code>dependabot</code>, Snyk — автоматически проверяют зависимости на
          известные CVE. <strong>Pinning</strong> версий и проверка подписей
          пакетов (npm provenance) снижают риск незамеченного обновления.
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
