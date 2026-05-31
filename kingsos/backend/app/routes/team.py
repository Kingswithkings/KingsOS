from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db

router = APIRouter(
    prefix="/team",
    tags=["Team"]
)


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    role = Column(String)
    status = Column(String, default="active")


Base.metadata.create_all(bind=engine)


@router.post("/create")
def create_member(
    full_name: str,
    email: str,
    role: str,
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
        role=role
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
