# Collection of vulnerable applications

Educational platform for learning web vulnerabilities from the [OWASP Top 10](https://owasp.org/www-project-top-ten/). Each lab is a small realistic app (blog comments, search, profiles, SSO, diagnostics tools) with a real, exploitable bug. Completing a level requires the attack to actually work — not matching a string in an input field.

This project is a diploma thesis: a **launcher** (accounts, theory, progress) wraps **sandbox levels** that are intentionally vulnerable.

> The launcher is meant to be safe. The levels are not. Do not expose them to the public internet.

## How it works

```
┌─────────────────────────────────────────────────────────┐
│  Launcher (safe)                                        │
│  accounts · theory · progress · UI chrome                │
│                                                         │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│    │ Level 1 XSS │  │ Level 2 SQLi│  │ Level 3 … │ …   │
│    │ (vulnerable)│  │ (vulnerable)│  │             │     │
│    └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

- **Frontend** (`frontend/`) — React + TypeScript + Vite. Dashboard, theory pages, and the sandboxed lab UI.
- **Backend** (`backend/`) — FastAPI + PostgreSQL. Auth, progress, and the vulnerable lab endpoints.
- **Win condition** — XSS must execute JavaScript; SQLi/IDOR must return data the player should not see; auth/JWT levels succeed on a real privileged response; CSRF is recorded on the server after an action runs as the victim.

Register an account, read the theory for a category, then open a level and exploit the app inside it.

## Levels

| # | Level | What you practice |
|---|--------|-------------------|
| 1 | Stored XSS | Inject JavaScript that persists in comments and runs for later visitors |
| 2 | SQL Injection | Bypass a search query and reach a hidden admin record |
| 3 | IDOR | Reach another user's private profile by changing the object ID |
| 4 | Broken Authentication | Tamper with a JWT / session token to gain admin rights |
| 5 | SSRF | Make the server fetch internal infrastructure and leak secrets |
| 6 | Path Traversal | Escape a file-download directory with `../` and read system files |
| 7 | Security Misconfiguration | Log into a panel that still uses default credentials |
| 8 | Cryptographic Failures | Recover a password stored as an unsalted MD5 hash |
| 9 | Command Injection | Inject a shell command into a network-diagnostics tool |
| 10 | CSRF | Trigger a bank transfer from a malicious page in the victim's session |
| 11 | Supply Chain Attack | Spot a typosquatted package and see a malicious install hook run |

## Requirements

- [Docker](https://docs.docker.com/get-docker/) **or** Python 3.12+, Node.js 18+, and PostgreSQL 16
- Git

## Quick start (Docker)

This is the fastest way to run the full stack (Postgres, API, UI):

```bash
docker compose up --build
```

Then open [http://localhost:8080](http://localhost:8080). The API is at [http://localhost:8000](http://localhost:8000).

Migrations run automatically when the backend container starts.

Optional environment variables (create a `.env` in the repo root, or export them):

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET` | `change-me-in-production` | JWT signing key |
| `VITE_API_URL` | `http://localhost:8000` | API URL baked into the frontend image |
| `APP_URL` | `http://localhost:8080` | Base URL in verification / password-reset emails |
| `RESEND_API_KEY` | empty | If unset, email links are printed in the backend logs |

## Local development

Use this when you want hot reload. PostgreSQL can still run in Docker.

### 1. Database

```bash
docker compose up postgres -d
```

Or create a local database:

```sql
CREATE DATABASE websec_sandbox;
```

### 2. Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtualenv:

```powershell
# Windows
.venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
source .venv/bin/activate
```

```bash
pip install -e .
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://websec:websec@localhost:5432/websec_sandbox
JWT_SECRET=replace-me-with-a-long-random-string
APP_URL=http://localhost:5173
```

If you created the database yourself, change the user, password, and database name in `DATABASE_URL`.

`RESEND_API_KEY` is optional. Without it, registration and password-reset links are printed in the backend console.

Apply migrations (from the repo root):

```powershell
python s m
```

Or:

```bash
cd backend
.venv/Scripts/alembic upgrade head   # Windows
# .venv/bin/alembic upgrade head      # macOS / Linux
```

### 3. Frontend

```bash
cd frontend
npm install
```

### 4. Run

From the repo root, in two terminals:

```powershell
python s b    # API  → http://127.0.0.1:8000
python s f    # UI   → http://localhost:5173
```

The helper `s` script is Windows-oriented (it calls `.venv\Scripts\...`). On macOS / Linux:

```bash
cd backend && .venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173), register, and confirm the email using the link from the backend console.

### Helper script (`python s`)

| Command | Action |
|---------|--------|
| `python s b` | Start the API with reload |
| `python s f` | Start the Vite dev server |
| `python s m` | `alembic upgrade head` |
| `python s r` | `alembic downgrade base` (drops migrated schema) |
| `python s --help` | List commands |

## Tests

```bash
cd backend
pip install -e ".[test]"
.venv/Scripts/python -m pytest   # Windows
# .venv/bin/python -m pytest      # macOS / Linux
```

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19, TypeScript, Vite, SCSS modules |
| API | FastAPI, SQLAlchemy (async), Alembic, Pydantic |
| DB | PostgreSQL 16 |
| Auth | JWT (launcher accounts, separate from lab JWTs) |
| Deploy | Docker Compose; production images via `docker-compose.deploy.yml` |
