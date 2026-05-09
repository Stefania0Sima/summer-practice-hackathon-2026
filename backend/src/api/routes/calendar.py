from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from core.security import get_current_user
from db.database import get_db
from db.schema import Event, UserRecord

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/event/{event_id}.ics")
def export_event_ics(event_id: int, user: UserRecord = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    dtstart = _format_dt(event.date, event.time or "18:00")
    dtend = _format_dt(event.date, _add_hour(event.time or "18:00"))

    participants = [p.user.name or p.user.email for p in event.participants]
    description = event.description or ""
    if participants:
        description += f"\\nPlayers: {', '.join(participants)}"
    if event.captain:
        description += f"\\nCaptain: {event.captain.name or event.captain.email}"

    ics = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ShowUp2Move//EN
BEGIN:VEVENT
DTSTART:{dtstart}
DTEND:{dtend}
SUMMARY:{event.title}
LOCATION:{event.location or "TBD"}
DESCRIPTION:{description}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return PlainTextResponse(
        content=ics,
        media_type="text/calendar",
        headers={"Content-Disposition": f'attachment; filename="event_{event_id}.ics"'},
    )


def _format_dt(date_str: str, time_str: str) -> str:
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        return dt.strftime("%Y%m%dT%H%M00")
    except ValueError:
        return datetime.now().strftime("%Y%m%dT180000")


def _add_hour(time_str: str) -> str:
    try:
        parts = time_str.split(":")
        h = (int(parts[0]) + 1) % 24
        return f"{h:02d}:{parts[1]}"
    except (ValueError, IndexError):
        return "19:00"
