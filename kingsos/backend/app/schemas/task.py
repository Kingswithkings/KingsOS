from sqlalchemy import Column, Integer, String
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, default="medium")
    status = Column(String, default="pending")
    due_date = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    customer_id = Column(Integer, nullable=True)
    project_id = Column(Integer, nullable=True)
    assigned_user_id = Column(Integer, nullable=True)
    business_id = Column(Integer, nullable=True)
