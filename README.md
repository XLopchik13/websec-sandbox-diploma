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

### Database Setup
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
