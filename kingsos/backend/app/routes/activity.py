from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models.activity import Activity

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


Base.metadata.create_all(bind=engine)


@router.get("/")
def get_activity(db: Session = Depends(get_db)):
    activities = (
        db.query(Activity)
        .order_by(Activity.id.desc())
        .all()
    )

    return {
        "total": len(activities),
        "activities": activities
    }
