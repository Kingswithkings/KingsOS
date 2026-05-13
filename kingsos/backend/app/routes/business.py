from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db, Base, engine
from app.models.business import Business
from app.schemas.business import BusinessCreate, BusinessResponse

Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/business",
    tags=["Business Onboarding"]
)

@router.post("/onboard", response_model=BusinessResponse)
def onboard_business(
    business_data: BusinessCreate,
    db: Session = Depends(get_db)
):
    new_business = Business(**business_data.model_dump())
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    return new_business


@router.get("/", response_model=list[BusinessResponse])
def get_businesses(db: Session = Depends(get_db)):
    return db.query(Business).all()