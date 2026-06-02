from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from kingsos.backend.app.schemas.team import TeamMember

router = APIRouter(
    prefix="/team",
    tags=["Team"]
)

Base.metadata.create_all(bind=engine)


def ensure_team_columns():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(
                text("PRAGMA table_info(team_members)")
            )
        }

        if "business_id" not in columns:
            connection.execute(
                text("ALTER TABLE team_members ADD COLUMN business_id INTEGER")
            )


ensure_team_columns()


@router.post("/create")
def create_member(
    full_name: str,
    email: str,
    role: str,
    business_id: int = None,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(TeamMember)
        .filter(TeamMember.email == email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Member already exists"
        )

    member = TeamMember(
        full_name=full_name,
        email=email,
        role=role,
        business_id=business_id
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


@router.get("/")
def get_team(db: Session = Depends(get_db)):
    members = db.query(TeamMember).all()

    return {
        "total": len(members),
        "members": members
    }
