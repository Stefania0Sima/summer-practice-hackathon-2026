import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy import text

from api.routes import auth, users, sports, availability, events, matching, polls, venues, ai
from db.database import engine, Base, SessionLocal
from db.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        for stmt in [
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS compatibility_score INTEGER",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0",
        ]:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(title="ShowUp2Move API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sports.router)
app.include_router(availability.router)
app.include_router(events.router)
app.include_router(matching.router)
app.include_router(polls.router)
app.include_router(venues.router)
app.include_router(ai.router)

upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/")
def read_root():
    return {"message": "ShowUp2Move API is running"}