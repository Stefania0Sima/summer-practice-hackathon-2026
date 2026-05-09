from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.security import get_current_user
from db.database import get_db
from db.schema import Event, Poll, PollOption, PollVote, UserRecord

router = APIRouter(prefix="/api", tags=["polls"])


class CreatePoll(BaseModel):
    question: str
    options: list[str]


class CastVote(BaseModel):
    option_id: int


@router.post("/events/{event_id}/polls")
def create_poll(event_id: int, body: CreatePoll, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    poll = Poll(event_id=event_id, question=body.question)
    db.add(poll)
    db.flush()

    for text in body.options:
        db.add(PollOption(poll_id=poll.id, text=text))
    db.commit()
    db.refresh(poll)
    return _poll_response(poll, user.id)


@router.get("/events/{event_id}/polls")
def get_polls(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    polls = db.query(Poll).filter(Poll.event_id == event_id).order_by(Poll.created_at.desc()).all()
    return [_poll_response(p, user.id) for p in polls]


@router.post("/polls/{poll_id}/vote")
def vote(poll_id: int, body: CastVote, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    option = db.query(PollOption).filter(PollOption.id == body.option_id, PollOption.poll_id == poll_id).first()
    if not option:
        raise HTTPException(status_code=400, detail="Invalid option")

    existing = db.query(PollVote).filter(PollVote.poll_id == poll_id, PollVote.user_id == user.id).first()
    if existing:
        existing.option_id = body.option_id
    else:
        db.add(PollVote(poll_id=poll_id, option_id=body.option_id, user_id=user.id))
    db.commit()
    return _poll_response(poll, user.id)


def _poll_response(poll: Poll, current_user_id: int) -> dict:
    options = []
    total_votes = sum(len(o.votes) for o in poll.options)
    user_vote_option_id = None
    for o in poll.options:
        vote_count = len(o.votes)
        for v in o.votes:
            if v.user_id == current_user_id:
                user_vote_option_id = o.id
        options.append({
            "id": o.id,
            "text": o.text,
            "extra": o.extra,
            "votes": vote_count,
            "percentage": int(vote_count / total_votes * 100) if total_votes > 0 else 0,
        })
    return {
        "id": poll.id,
        "question": poll.question,
        "options": options,
        "total_votes": total_votes,
        "user_vote": user_vote_option_id,
    }
