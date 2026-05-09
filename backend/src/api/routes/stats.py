from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.security import get_current_user
from db.database import get_db
from db.schema import Availability, EventParticipant, Event, UserRecord

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/me")
def my_stats(user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    events_joined = db.query(EventParticipant).filter(EventParticipant.user_id == user.id).count()

    captain_count = db.query(Event).filter(Event.captain_id == user.id).count()

    today = date.today()
    streak = 0
    for i in range(30):
        d = (today - timedelta(days=i)).isoformat()
        avail = db.query(Availability).filter(
            Availability.user_id == user.id,
            Availability.date == d,
            Availability.active == True,
        ).first()
        if avail:
            streak += 1
        elif i > 0:
            break

    groups = db.query(EventParticipant.event_id).filter(EventParticipant.user_id == user.id).distinct().count()

    sport_events = {}
    participations = db.query(EventParticipant).filter(EventParticipant.user_id == user.id).all()
    for p in participations:
        key = p.event.sport_key
        sport_events[key] = sport_events.get(key, 0) + 1
    favorite_sport = max(sport_events, key=sport_events.get) if sport_events else None

    achievements = []
    if events_joined >= 1:
        achievements.append({"key": "first_game", "name": "First Game", "icon": "trophy"})
    if events_joined >= 5:
        achievements.append({"key": "regular", "name": "Regular Player", "icon": "star"})
    if events_joined >= 10:
        achievements.append({"key": "veteran", "name": "Veteran", "icon": "award"})
    if streak >= 3:
        achievements.append({"key": "streak_3", "name": "3-Day Streak", "icon": "flame"})
    if streak >= 7:
        achievements.append({"key": "streak_7", "name": "Week Warrior", "icon": "zap"})
    if captain_count >= 1:
        achievements.append({"key": "captain", "name": "Team Captain", "icon": "crown"})
    if groups >= 3:
        achievements.append({"key": "social", "name": "Social Butterfly", "icon": "users"})

    return {
        "events_joined": events_joined,
        "streak": streak,
        "groups": groups,
        "captain_count": captain_count,
        "favorite_sport": favorite_sport,
        "achievements": achievements,
    }
