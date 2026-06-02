from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models.activity import Activity
from kingsos.backend.app.schemas.task import Task


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

Base.metadata.create_all(bind=engine)


def ensure_task_columns():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(tasks)"))
        }

        if "project_id" not in columns:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN project_id INTEGER")
            )

        if "assigned_user_id" not in columns:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN assigned_user_id INTEGER")
            )

        if "business_id" not in columns:
            connection.execute(
                text("ALTER TABLE tasks ADD COLUMN business_id INTEGER")
            )


ensure_task_columns()


@router.post("/create")
def create_task(
    title: str,
    description: str = None,
    priority: str = "medium",
    status: str = "pending",
    due_date: str = None,
    assigned_to: str = None,
    assigned_user_id: int = None,
    customer_id: int = None,
    project_id: int = None,
    business_id: int = None,
    db: Session = Depends(get_db)
):
    new_task = Task(
        title=title,
        description=description,
        priority=priority,
        status=status,
        due_date=due_date,
        assigned_to=assigned_to,
        assigned_user_id=assigned_user_id,
        customer_id=customer_id,
        project_id=project_id,
        business_id=business_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    activity = Activity(
        action="Created Task",
        entity_type="Task",
        entity_id=new_task.id,
        user="Kings",
        timestamp=str(datetime.now())
    )

    db.add(activity)
    db.commit()

    return {
        "message": "Task created successfully",
        "task": new_task
    }


@router.get("/")
def get_all_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return {"total": len(tasks), "tasks": tasks}


@router.get("/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

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
    assigned_user_id: int = None,
    customer_id: int = None,
    project_id: int = None,
    business_id: int = None,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

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
    if assigned_user_id is not None:
        task.assigned_user_id = assigned_user_id
    if customer_id is not None:
        task.customer_id = customer_id
    if project_id is not None:
        task.project_id = project_id
    if business_id is not None:
        task.business_id = business_id

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
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
