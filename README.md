# Collection of vulnerable applications

## Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL

### Installation

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -e .
```

**Frontend:**
```bash
cd frontend
npm install
```

### Configuration

Create `.env` file in `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
```

### Database Setup

1. Create PostgreSQL database
2. Run migrations:
```bash
cd backend
alembic upgrade head
```

### Running

**Backend:**
```bash
python s b
```

**Frontend:**
```bash
python s f
```
