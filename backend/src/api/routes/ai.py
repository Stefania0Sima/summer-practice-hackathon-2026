import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.config import settings
from core.security import get_current_user
from db.database import get_db
from db.schema import UserRecord

router = APIRouter(prefix="/api/ai", tags=["ai"])

VALID_SPORTS = ["football", "basketball", "tennis", "volleyball", "running", "cycling", "swimming", "table-tennis", "badminton"]


def _get_gemini_model():
    if not settings.gemini_api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=settings.gemini_api_key)
        return client
    except Exception:
        return None


class AnalyzeBioRequest(BaseModel):
    bio: str


class CompatibilityRequest(BaseModel):
    user_ids: list[int]
    sport_key: str


@router.post("/analyze-bio")
def analyze_bio(body: AnalyzeBioRequest, user: UserRecord = Depends(get_current_user)):
    client = _get_gemini_model()
    if not client:
        return _fallback_bio_analysis(body.bio)

    prompt = f"""Analyze this user's bio and identify which sports they are interested in.
Return ONLY a JSON object with:
- "sports": array of sport keys from this list: {VALID_SPORTS}
- "skill_hints": object mapping sport_key to estimated skill level ("Beginner", "Intermediate", "Advanced")
- "interests": array of short interest tags extracted from the bio

Bio: "{body.bio}"

Return ONLY valid JSON, no markdown."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception:
        return _fallback_bio_analysis(body.bio)


@router.post("/compatibility")
def compatibility_score(body: CompatibilityRequest, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    from db.schema import UserSport, Sport

    sport = db.query(Sport).filter(Sport.key == body.sport_key).first()
    if not sport:
        raise HTTPException(status_code=400, detail="Unknown sport")

    users = db.query(UserRecord).filter(UserRecord.id.in_(body.user_ids)).all()
    if not users:
        return {"score": 0, "reason": "No users found"}

    skills = []
    bios = []
    cities = []
    for u in users:
        us = db.query(UserSport).filter(UserSport.user_id == u.id, UserSport.sport_id == sport.id).first()
        skills.append(us.skill_level if us else "Beginner")
        if u.bio:
            bios.append(u.bio)
        if u.city:
            cities.append(u.city)

    client = _get_gemini_model()
    if client and bios:
        prompt = f"""Rate the compatibility of these sports group members from 0-100.
Sport: {sport.name}
Members skill levels: {skills}
Members bios: {bios}
Members cities: {cities}

Return ONLY a JSON object with:
- "score": integer 0-100
- "reason": one sentence explanation

Return ONLY valid JSON, no markdown."""
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        except Exception:
            pass

    skill_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    vals = [skill_map.get(s, 2) for s in skills]
    spread = max(vals) - min(vals) if vals else 0
    same_city = len(set(cities)) <= 1 if cities else True
    score = 85 - spread * 10 + (10 if same_city else 0)
    score = max(30, min(100, score))
    return {"score": score, "reason": "Based on skill level similarity and location proximity"}


def _fallback_bio_analysis(bio: str) -> dict:
    bio_lower = bio.lower()
    found = []
    hints = {}
    keywords = {
        "football": ["football", "soccer", "5-a-side", "striker", "goalkeeper"],
        "basketball": ["basketball", "hoops", "dunk"],
        "tennis": ["tennis", "racket", "court"],
        "volleyball": ["volleyball", "volley"],
        "running": ["running", "run", "jog", "marathon", "sprint"],
        "cycling": ["cycling", "bike", "bicycle", "ride"],
        "swimming": ["swimming", "swim", "pool"],
        "table-tennis": ["table tennis", "ping pong", "pingpong"],
        "badminton": ["badminton", "shuttlecock"],
    }
    for sport_key, kws in keywords.items():
        for kw in kws:
            if kw in bio_lower:
                if sport_key not in found:
                    found.append(sport_key)
                    hints[sport_key] = "Intermediate"
                break

    return {"sports": found, "skill_hints": hints, "interests": []}
