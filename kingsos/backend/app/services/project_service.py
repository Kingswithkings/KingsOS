from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate


def create_project(db: Session, project_data: ProjectCreate):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        owner=project_data.owner,
        business_id=project_data.business_id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project
