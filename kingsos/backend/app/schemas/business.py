from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BusinessCreate(BaseModel):
    business_name: str
    industry: str
    business_description: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    business_stage: Optional[str] = None
    number_of_employees: Optional[str] = None
    website: Optional[str] = None
    main_goal: Optional[str] = None
    biggest_challenge: Optional[str] = None
    products_or_services: Optional[str] = None

class BusinessResponse(BusinessCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True