# Collection of vulnerable applications

Образовательная платформа, демонстрирующая веб-уязвимости (XSS, SQL Injection, IDOR,
Broken Auth, JWT и другие) на намеренно уязвимых «песочницах».

## Хостинг

> Демо доступно по **[адресу](http://89.110.91.79:8080/dashboard)**

Деплой автоматический: пуш в `main` собирает образы и публикует их в GHCR, после чего
GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) по SSH
обновляет контейнеры на сервере через [docker-compose.deploy.yml](docker-compose.deploy.yml).

## Запуск через Docker (быстрый старт)

Поднимает PostgreSQL, backend и frontend одной командой. Фронтенд будет на
<http://localhost:8080>, API — на <http://localhost:8000>.

```bash
copy .env.example .env   # при необходимости отредактируйте значения
docker compose up --build
```

Миграции применятся автоматически при старте backend-контейнера.

## Запуск локально (без Docker)

### Требования

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .
```

Создайте `.env` **в корне проекта** (один файл и для локального запуска, и для Docker):

```bash
copy .env.example .env
```

Минимально нужно заполнить `DATABASE_URL` и `JWT_SECRET`. Переменные:

- `DATABASE_URL` — строка подключения к PostgreSQL (`postgresql+asyncpg://user:password@host:port/dbname`)
- `JWT_SECRET` — секретный ключ для подписи JWT
- `RESEND_API_KEY` — **опционально**. Если пусто, подтверждение почты отключено:
  регистрация сразу активирует аккаунт, вход работает без письма. См. раздел «Почта».
- `APP_URL` — базовый URL фронтенда для ссылок в письмах (по умолчанию `http://localhost:5173`)

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. База данных и миграции

Создайте базу (`CREATE DATABASE dbname;`), затем из корня проекта:

```bash
python s m      # применить миграции
python s r      # откатить миграции
```

### 4. Запуск серверов

Из корня проекта:

```bash
python s b      # backend → http://127.0.0.1:8000
python s f      # frontend → http://localhost:5173
```

`python s --help` — список всех команд.

## Почта (Resend) — опционально

Подтверждение email и сброс пароля работают через [Resend](https://resend.com).
Параметр **необязательный**:

- **`RESEND_API_KEY` не задан** → письма не отправляются, подтверждение почты
  отключено. Регистрация сразу создаёт активированный аккаунт. Удобно для локальной
  разработки и демонстрации.
- **`RESEND_API_KEY` задан** → при регистрации отправляется письмо со ссылкой
  подтверждения, вход до подтверждения заблокирован.

Чтобы письма доходили до **любых** адресатов (а не только до владельца аккаунта Resend),
нужно верифицировать собственный домен в Resend и указать отправителя на этом домене:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@your-verified-domain.com
```

Адрес по умолчанию `onboarding@resend.dev` — это общий sandbox-отправитель Resend,
который доставляет письма только на email, привязанный к вашему аккаунту Resend.
