import os
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import UserRecord, UserSport, Sport

router = APIRouter(prefix="/api/users", tags=["users"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    city: str | None = None


class SportPref(BaseModel):
    sport_key: str
    skill_level: str = "Beginner"


class SportsUpdate(BaseModel):
    sports: list[SportPref]


@router.get("/me")
def get_me(user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    sports = []
    for us in user.sports:
        sports.append({
            "sport_key": us.sport.key,
            "sport_name": us.sport.name,
            "skill_level": us.skill_level,
        })
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "bio": user.bio,
        "city": user.city,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "sports": sports,
    }


@router.put("/me")
def update_me(body: ProfileUpdate, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.name is not None:
        user.name = body.name
    if body.bio is not None:
        user.bio = body.bio
    if body.city is not None:
        user.city = body.city
    db.commit()
    db.refresh(user)
    return {"ok": True}


@router.put("/me/sports")
def update_sports(body: SportsUpdate, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(UserSport).filter(UserSport.user_id == user.id).delete()

    for sp in body.sports:
        sport = db.query(Sport).filter(Sport.key == sp.sport_key).first()
        if sport:
            db.add(UserSport(user_id=user.id, sport_id=sport.id, skill_level=sp.skill_level))
    db.commit()
    return {"ok": True}


@router.post("/me/avatar")
def upload_avatar(file: UploadFile = File(...), user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"avatar_{user.id}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    user.avatar_url = f"/uploads/{filename}"
    db.commit()
    return {"avatar_url": user.avatar_url}
