from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


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


Base.metadata.create_all(bind=engine)


@router.post("/create")
def create_task(
    title: str,
    description: str = None,
    priority: str = "medium",
    status: str = "pending",
    due_date: str = None,
    assigned_to: str = None,
    customer_id: int = None,
    db: Session = Depends(get_db)
):
    new_task = Task(
        title=title,
        description=description,
        priority=priority,
        status=status,
        due_date=due_date,
        assigned_to=assigned_to,
        customer_id=customer_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": new_task
    }


@router.get("/")
def get_all_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()

    return {
        "total": len(tasks),
        "tasks": tasks
    }


@router.get("/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}")
def update_task(
    task_id: int,
    title: str = None,
    description: str = None,
    priority: str = None,
    status: str = None,
    due_date: str = None,
    assigned_to: str = None,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if title is not None:
        task.title = title

    if description is not None:
        task.description = description

    if priority is not None:
        task.priority = priority

    if status is not None:
        task.status = status

    if due_date is not None:
        task.due_date = due_date

    if assigned_to is not None:
        task.assigned_to = assigned_to

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task": task
    }


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }