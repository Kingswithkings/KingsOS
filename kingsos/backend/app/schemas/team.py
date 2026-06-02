from sqlalchemy import Column, Integer, String
from app.database import Base


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    role = Column(String)
    status = Column(String, default="active")
    business_id = Column(Integer, nullable=True)
