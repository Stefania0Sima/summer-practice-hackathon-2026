from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import Availability, UserRecord

router = APIRouter(prefix="/api/availability", tags=["availability"])


class SetAvailability(BaseModel):
    sport_key: str


@router.post("/today")
def set_available_today(body: SetAvailability, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today().isoformat()
    existing = db.query(Availability).filter(
        Availability.user_id == user.id,
        Availability.date == today,
    ).first()

    if existing:
        existing.sport_key = body.sport_key
        existing.active = True
    else:
        db.add(Availability(user_id=user.id, date=today, sport_key=body.sport_key, active=True))
    db.commit()
    return {"ok": True, "date": today, "sport_key": body.sport_key}


@router.get("/today")
def get_today(user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today().isoformat()
    avail = db.query(Availability).filter(
        Availability.user_id == user.id,
        Availability.date == today,
    ).first()
    if not avail:
        return {"available": False}
    return {"available": avail.active, "sport_key": avail.sport_key, "date": avail.date}


@router.delete("/today")
def cancel_today(user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today().isoformat()
    db.query(Availability).filter(
        Availability.user_id == user.id,
        Availability.date == today,
    ).delete()
    db.commit()
    return {"ok": True}


@router.get("/available-users")
def available_users(sport_key: str | None = None, db: Session = Depends(get_db)):
    today = date.today().isoformat()
    q = db.query(Availability).filter(Availability.date == today, Availability.active == True)
    if sport_key:
        q = q.filter(Availability.sport_key == sport_key)
    avails = q.all()
    users = []
    for a in avails:
        u = a.user
        users.append({
            "id": u.id,
            "name": u.name,
            "city": u.city,
            "sport_key": a.sport_key,
        })
    return users
