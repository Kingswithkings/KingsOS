from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database.db import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(Integer, ForeignKey("users.id"))

    business_name = Column(String, nullable=False)

    industry = Column(String, nullable=False)

    business_description = Column(Text, nullable=True)

    country = Column(String, nullable=True)

    city = Column(String, nullable=True)

    business_stage = Column(String, nullable=True)

    number_of_employees = Column(String, nullable=True)

    website = Column(String, nullable=True)

    main_goal = Column(Text, nullable=True)

    biggest_challenge = Column(Text, nullable=True)

    products_or_services = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)