from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from kingsos.backend.app.schemas.project import Project
from kingsos.backend.app.schemas.task import Task

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

Base.metadata.create_all(bind=engine)


def ensure_project_columns():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(projects)"))
        }

        if "business_id" not in columns:
            connection.execute(
                text("ALTER TABLE projects ADD COLUMN business_id INTEGER")
            )


ensure_project_columns()


@router.post("/create")
def create_project(
    name: str,
    description: str = None,
    status: str = "active",
    owner: str = None,
    business_id: int = None,
    db: Session = Depends(get_db)
):
    project = Project(
        name=name,
        description=description,
        status=status,
        owner=owner,
        business_id=business_id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully",
        "project": project
    }


@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()

    return {
        "total": len(projects),
        "projects": projects
    }


@router.get("/{project_id}/tasks")
def get_project_tasks(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    total_tasks = len(tasks)
    completed_tasks = len([
        task for task in tasks if task.status == "completed"
    ])

    progress = 0

    if total_tasks > 0:
        progress = round((completed_tasks / total_tasks) * 100, 2)

    return {
        "project": project,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "progress": progress,
        "tasks": tasks
    }


@router.get("/{project_id}/summary")
def project_summary(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    total = len(tasks)
    completed = len([task for task in tasks if task.status == "completed"])
    progress = 0

    if total > 0:
        progress = round((completed / total) * 100, 2)

    return {
        "project": project,
        "tasks": tasks,
        "progress": progress
    }


@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project
