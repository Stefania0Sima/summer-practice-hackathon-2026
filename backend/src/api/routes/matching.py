import random
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import Availability, Event, EventParticipant, Sport, UserRecord, UserSport, Venue

router = APIRouter(prefix="/api/matching", tags=["matching"])


class MatchRequest(BaseModel):
    sport_key: str


@router.post("/run")
def run_matching(body: MatchRequest, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today().isoformat()
    sport = db.query(Sport).filter(Sport.key == body.sport_key).first()
    if not sport:
        raise HTTPException(status_code=400, detail="Unknown sport")

    avails = db.query(Availability).filter(
        Availability.date == today,
        Availability.sport_key == body.sport_key,
        Availability.active == True,
    ).all()

    available_user_ids = {a.user_id for a in avails}
    available_user_ids.add(user.id)
    all_users = db.query(UserRecord).filter(UserRecord.id.in_(available_user_ids)).all()

    if len(all_users) < sport.min_group:
        players_info = []
        for u in all_users:
            us = db.query(UserSport).filter(UserSport.user_id == u.id, UserSport.sport_id == sport.id).first()
            players_info.append({
                "id": u.id,
                "name": u.name or "User",
                "skill_level": us.skill_level if us else "Beginner",
                "is_captain": u.id == user.id,
                "city": u.city,
            })
        return {
            "matched": False,
            "players": players_info,
            "needed": sport.min_group,
            "current": len(all_users),
            "sport_key": body.sport_key,
            "sport_name": sport.name,
            "compatibility_score": None,
            "event_id": None,
        }

    group_size = min(len(all_users), sport.max_group)
    if user not in all_users[:group_size]:
        all_users = [user] + [u for u in all_users if u.id != user.id]
    group = all_users[:group_size]

    skill_counts = {"Beginner": 0, "Intermediate": 0, "Advanced": 0}
    players_info = []
    captain = random.choice(group)
    for u in group:
        us = db.query(UserSport).filter(UserSport.user_id == u.id, UserSport.sport_id == sport.id).first()
        skill = us.skill_level if us else "Beginner"
        skill_counts[skill] = skill_counts.get(skill, 0) + 1
        players_info.append({
            "id": u.id,
            "name": u.name or "User",
            "skill_level": skill,
            "is_captain": u.id == captain.id,
            "city": u.city,
        })

    total = len(group)
    variety = len([v for v in skill_counts.values() if v > 0])
    balance = min(skill_counts[k] for k in skill_counts if skill_counts[k] > 0) / max(1, max(skill_counts.values()))
    compatibility = int(60 + variety * 8 + balance * 20 + min(total, 10))

    venue = db.query(Venue).filter(Venue.sport_keys.contains(body.sport_key)).first()
    location = venue.name if venue else None

    event = Event(
        title=f"{sport.name} — Auto Match",
        sport_key=body.sport_key,
        date=today,
        time="18:00",
        location=location,
        max_players=sport.max_group,
        captain_id=captain.id,
        source="auto_match",
    )
    db.add(event)
    db.flush()

    for u in group:
        db.add(EventParticipant(event_id=event.id, user_id=u.id, status="confirmed"))

    if venue:
        from db.schema import Poll, PollOption
        nearby_venues = db.query(Venue).filter(Venue.sport_keys.contains(body.sport_key)).limit(3).all()
        if nearby_venues:
            poll = Poll(event_id=event.id, question="Where should we play?")
            db.add(poll)
            db.flush()
            for v in nearby_venues:
                price_str = f"{int(v.price_per_hour)} RON/h" if v.price_per_hour else "Free"
                db.add(PollOption(poll_id=poll.id, text=v.name, extra=f"{v.address} — {price_str}"))

    db.commit()
    db.refresh(event)

    return {
        "matched": True,
        "players": players_info,
        "needed": sport.min_group,
        "current": len(group),
        "sport_key": body.sport_key,
        "sport_name": sport.name,
        "compatibility_score": compatibility,
        "event_id": event.id,
    }
