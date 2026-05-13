from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String

from app.database import get_db, Base, engine

router = APIRouter(
    prefix="/business",
    tags=["Business"]
)


# =========================
# DATABASE MODEL
# =========================
class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)


# Create table
Base.metadata.create_all(bind=engine)


# =========================
# ROUTES
# =========================

@router.get("/")
def get_all_businesses(db: Session = Depends(get_db)):
    businesses = db.query(Business).all()

    return {
        "total": len(businesses),
        "businesses": businesses
    }


@router.post("/create")
def create_business(
    business_name: str,
    business_type: str,
    owner_name: str,
    email: str,
    db: Session = Depends(get_db)
):
    existing_business = (
        db.query(Business)
        .filter(Business.email == email)
        .first()
    )

    if existing_business:
        raise HTTPException(
            status_code=400,
            detail="Business already exists"
        )

    new_business = Business(
        business_name=business_name,
        business_type=business_type,
        owner_name=owner_name,
        email=email
    )

    db.add(new_business)
    db.commit()
    db.refresh(new_business)

    return {
        "message": "Business created successfully",
        "business": new_business
    }


@router.get("/{business_id}")
def get_business(
    business_id: int,
    db: Session = Depends(get_db)
):
    business = (
        db.query(Business)
        .filter(Business.id == business_id)
        .first()
    )

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    return business