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
    # Force schema wipe to bypass Postgres constraint deadlocks
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
        
    Base.metadata.create_all(bind=engine)
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