# backend/src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from api.routes import auth
from db.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="App API", lifespan=lifespan)

app.include_router(auth.router)
 
@app.get("/")
def read_root():
    return {"message": "Backend is running"}