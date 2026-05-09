from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import Event, EventParticipant, Message, UserRecord

router = APIRouter(prefix="/api/events", tags=["events"])


class CreateEvent(BaseModel):
    title: str
    sport_key: str
    date: str
    time: str | None = None
    location: str | None = None
    description: str | None = None
    max_players: int = 10
    is_public: bool = True


class SendMessage(BaseModel):
    text: str


@router.post("", status_code=status.HTTP_201_CREATED)
def create_event(body: CreateEvent, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = Event(
        title=body.title,
        sport_key=body.sport_key,
        date=body.date,
        time=body.time,
        location=body.location,
        description=body.description,
        max_players=body.max_players,
        is_public=body.is_public,
        captain_id=user.id,
        source="manual",
    )
    db.add(event)
    db.flush()
    db.add(EventParticipant(event_id=event.id, user_id=user.id, status="confirmed"))
    db.commit()
    db.refresh(event)
    return {"id": event.id}


@router.get("")
def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.is_public == True).order_by(Event.created_at.desc()).limit(50).all()
    return [_event_summary(e) for e in events]


@router.get("/mine")
def my_events(user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    participations = db.query(EventParticipant).filter(EventParticipant.user_id == user.id).all()
    event_ids = [p.event_id for p in participations]
    if not event_ids:
        return []
    events = db.query(Event).filter(Event.id.in_(event_ids)).order_by(Event.created_at.desc()).all()
    return [_event_summary(e) for e in events]


@router.get("/{event_id}")
def get_event(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    participants = []
    for ep in event.participants:
        u = ep.user
        participants.append({
            "id": u.id,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "is_captain": u.id == event.captain_id,
            "status": ep.status,
        })

    captain_name = event.captain.name if event.captain else None

    return {
        "id": event.id,
        "title": event.title,
        "sport_key": event.sport_key,
        "date": event.date,
        "time": event.time,
        "location": event.location,
        "description": event.description,
        "max_players": event.max_players,
        "is_public": event.is_public,
        "captain_id": event.captain_id,
        "captain_name": captain_name,
        "source": event.source,
        "participant_count": len(participants),
        "participants": participants,
    }


@router.post("/{event_id}/join")
def join_event(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.user_id == user.id,
    ).first()
    if existing:
        return {"ok": True, "status": existing.status}

    count = db.query(EventParticipant).filter(EventParticipant.event_id == event_id).count()
    if count >= event.max_players:
        raise HTTPException(status_code=400, detail="Event is full")

    db.add(EventParticipant(event_id=event_id, user_id=user.id, status="confirmed"))
    db.commit()
    return {"ok": True, "status": "confirmed"}


@router.post("/{event_id}/leave")
def leave_event(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.user_id == user.id,
    ).delete()
    db.commit()
    return {"ok": True}


@router.get("/{event_id}/messages")
def get_messages(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(Message.event_id == event_id).order_by(Message.created_at.asc()).limit(200).all()
    event = db.query(Event).filter(Event.id == event_id).first()
    result = []
    for m in msgs:
        result.append({
            "id": m.id,
            "sender_id": m.user_id,
            "sender_name": m.user.name or "User",
            "text": m.text,
            "is_captain": m.user_id == event.captain_id if event else False,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        })
    return result


@router.post("/{event_id}/messages")
def send_message(event_id: int, body: SendMessage, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    msg = Message(event_id=event_id, user_id=user.id, text=body.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "sender_id": user.id,
        "sender_name": user.name or "User",
        "text": msg.text,
        "is_captain": user.id == event.captain_id,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


def _event_summary(e: Event) -> dict:
    count = len(e.participants)
    captain_name = e.captain.name if e.captain else None
    status = "confirmed" if count >= 2 else "waiting"
    return {
        "id": e.id,
        "title": e.title,
        "sport_key": e.sport_key,
        "date": e.date,
        "time": e.time,
        "location": e.location,
        "max_players": e.max_players,
        "player_count": count,
        "status": status,
        "captain_name": captain_name,
        "source": e.source,
    }
