from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.schema import Venue

router = APIRouter(prefix="/api/venues", tags=["venues"])


@router.get("")
def list_venues(sport_key: str | None = None, city: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Venue)
    if sport_key:
        q = q.filter(Venue.sport_keys.contains(sport_key))
    if city:
        q = q.filter(Venue.city.ilike(f"%{city}%"))
    venues = q.order_by(Venue.rating.desc().nullslast()).all()
    return [
        {
            "id": v.id,
            "name": v.name,
            "address": v.address,
            "city": v.city,
            "sport_keys": v.sport_keys.split(",") if v.sport_keys else [],
            "price_per_hour": v.price_per_hour,
            "rating": v.rating,
            "lat": v.lat,
            "lng": v.lng,
        }
        for v in venues
    ]
