# Collection of vulnerable applications

## Установка зависимостей

### Backend (Python)

1. Создайте виртуальное окружение:
```powershell
cd backend
python -m venv .venv
```

2. Активируйте виртуальное окружение:
```powershell
.venv\Scripts\Activate.ps1
```

3. Установите зависимости:
```powershell
pip install -e .
```

### Frontend (Node.js)

1. Перейдите в папку frontend:
```powershell
cd frontend
```

2. Установите зависимости:
```powershell
npm install
```

## Настройка переменных окружения

Перед запуском проекта необходимо настроить переменные окружения для backend.

1. Создайте файл `.env` в папке `backend`:

2. Добавьте следующие переменные в файл `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-here
```

Где:
- `DATABASE_URL` - строка подключения к PostgreSQL базе данных (формат: `postgresql+asyncpg://user:password@host:port/dbname`)
- `JWT_SECRET` - секретный ключ для подписи JWT токенов (рекомендуется использовать длинную случайную строку)

## Настройка базы данных

### Создание базы данных

```sql
CREATE DATABASE websec_sandbox;
```

### Выполнение миграций (из корня)

```powershell
python s m
```

### Откат миграций

```powershell
python s r
```

## Запуск проекта (из корня)

После установки всех зависимостей вы можете запускать серверы с помощью удобного скрипта:

```powershell
# Запуск backend
python s b

# Запуск frontend
python s f
```
