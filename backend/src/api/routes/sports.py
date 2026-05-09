from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.schema import Sport

router = APIRouter(prefix="/api/sports", tags=["sports"])


@router.get("")
def list_sports(db: Session = Depends(get_db)):
    sports = db.query(Sport).order_by(Sport.id).all()
    return [
        {
            "id": s.id,
            "key": s.key,
            "name": s.name,
            "min_group": s.min_group,
            "max_group": s.max_group,
        }
        for s in sports
    ]
