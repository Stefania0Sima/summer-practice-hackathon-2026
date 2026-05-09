import random
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import Availability, Event, EventParticipant, Poll, PollOption, Sport, UserRecord, UserSport, Venue

router = APIRouter(prefix="/api/matching", tags=["matching"])

SKILL_MAP = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}


class MatchRequest(BaseModel):
    sport_key: str


def _user_score(u, user, sport, db):
    """Score a candidate for smart ranking: proximity + bio similarity + skill balance."""
    score = 0.0
    if user.city and u.city and u.city.lower() == user.city.lower():
        score += 30
    if user.bio and u.bio:
        user_words = set(user.bio.lower().split())
        u_words = set(u.bio.lower().split())
        overlap = len(user_words & u_words)
        score += min(overlap * 3, 20)
    us = db.query(UserSport).filter(UserSport.user_id == u.id, UserSport.sport_id == sport.id).first()
    if us:
        score += 10
    return score


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

    # Proximity: prefer same-city users
    if user.city:
        same_city = [u for u in all_users if u.city and u.city.lower() == user.city.lower()]
        same_city_ids = {u.id for u in same_city}
        others = [u for u in all_users if u.id not in same_city_ids]
        all_users = same_city + others

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

    # Smart ranking: score candidates by proximity + bio overlap + sport registration
    candidates = [u for u in all_users if u.id != user.id]
    candidates.sort(key=lambda u: _user_score(u, user, sport, db), reverse=True)

    group_size = min(len(all_users), sport.max_group)
    group = [user] + candidates[: group_size - 1]

    # Team balancing: sort by skill and interleave for balanced distribution
    skill_data = {}
    for u in group:
        us = db.query(UserSport).filter(UserSport.user_id == u.id, UserSport.sport_id == sport.id).first()
        skill_data[u.id] = us.skill_level if us else "Beginner"
    group.sort(key=lambda u: SKILL_MAP.get(skill_data[u.id], 2))

    skill_counts = {"Beginner": 0, "Intermediate": 0, "Advanced": 0}
    players_info = []
    captain = random.choice(group)
    for u in group:
        skill = skill_data[u.id]
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
    active_counts = [v for v in skill_counts.values() if v > 0]
    balance = min(active_counts) / max(1, max(active_counts))
    cities = [u.city for u in group if u.city]
    city_bonus = 5 if len(set(c.lower() for c in cities)) <= 1 else 0
    bio_count = sum(1 for u in group if u.bio)
    bio_bonus = min(bio_count * 2, 10)
    compatibility = int(min(100, 55 + variety * 8 + balance * 15 + min(total, 10) + city_bonus + bio_bonus))

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
        compatibility_score=compatibility,
    )
    db.add(event)
    db.flush()

    for u in group:
        status = "pending" if u.id == user.id else "confirmed"
        db.add(EventParticipant(event_id=event.id, user_id=u.id, status=status))

    # XP reward for participating
    for u in group:
        u.xp = (u.xp or 0) + 10
    captain.xp = (captain.xp or 0) + 5

    if venue:
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
