from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WebSec Sandbox API")


origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "WebSec Sandbox API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
