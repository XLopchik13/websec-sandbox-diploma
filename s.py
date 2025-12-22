#!/usr/bin/env python3

import sys
import subprocess
import os
from pathlib import Path

GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

ROOT_DIR = Path(__file__).parent.absolute()
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"


def print_info(msg: str):
    print(f"{GREEN}[INFO]{RESET} {msg}")


def print_error(msg: str):
    print(f"{RED}[ERROR]{RESET} {msg}")


def start_backend():
    print_info("Запуск backend...")

    os.chdir(BACKEND_DIR)

    if os.name == "nt":
        venv_python = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = BACKEND_DIR / ".venv" / "bin" / "python"

    if not venv_python.exists():
        print_error("Виртуальное окружение не найдено!")
        print_info("Создайте его командой: python -m venv backend/.venv")
        print_info("И установите зависимости: pip install -e backend/")
        return 1

    try:
        subprocess.run(
            [
                str(venv_python),
                "-m",
                "uvicorn",
                "app.main:app",
                "--reload",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ],
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print_error(f"Ошибка запуска backend: {e}")
        return 1
    except KeyboardInterrupt:
        print_info("\nBackend остановлен")
        return 0


def start_frontend():
    print_info("Запуск frontend...")

    os.chdir(FRONTEND_DIR)

    if not (FRONTEND_DIR / "node_modules").exists():
        print_error("node_modules не найдены!")
        print_info("Установите зависимости: cd frontend && npm install")
        return 1

    try:
        subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print_error(f"Ошибка запуска frontend: {e}")
        return 1
    except KeyboardInterrupt:
        print_info("\nFrontend остановлен")
        return 0


def main():
    if len(sys.argv) < 2:
        print_error("Не указана команда!")
        print(f"\n{YELLOW}Использование:{RESET}")
        print("  python s.py b  - запуск backend")
        print("  python s.py f  - запуск frontend")
        return 1

    command = sys.argv[1].lower()

    if command == "b":
        return start_backend()
    elif command == "f":
        return start_frontend()
    else:
        print_error(f"Неизвестная команда: {command}")
        print(f"{YELLOW}Доступные команды:{RESET} b (backend), f (frontend)")
        return 1


if __name__ == "__main__":
    sys.exit(main())
