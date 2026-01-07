import subprocess
import sys


def show_help():
    print("""
Usage: python s command

Available commands:
    b, backend      Start backend server
    f, frontend     Start frontend server
    --help          Show this help message

Examples:
    python s b      # Start backend
    python s f      # Start frontend
    """)


args = sys.argv[1:]

if len(args) == 0 or args[0] in ["-h", "--help", "help"]:
    show_help()
    sys.exit(0)

if args[0] in ["b", "backend"]:
    try:
        cmd_str = "cd backend && .venv\\Scripts\\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
        subprocess.run(cmd_str, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting backend: {e}")
        sys.exit(1)

elif args[0] in ["f", "frontend"]:
    try:
        cmd_str = "cd frontend && npm run dev"
        subprocess.run(cmd_str, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting frontend: {e}")
        sys.exit(1)

else:
    print(f"Unknown command: {args[0]}")
    print("Use --help to see available commands")
    sys.exit(1)
