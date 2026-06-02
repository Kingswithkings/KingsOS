from sqlalchemy import Column, Integer, String

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="active")
    owner = Column(String, nullable=True)
    business_id = Column(Integer, nullable=True)
