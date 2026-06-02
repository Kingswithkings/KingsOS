from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.database import Base, engine

from app.models.user import User
from app.models.business import Business
from kingsos.backend.app.schemas.customer import Customer
from kingsos.backend.app.schemas.task import Task
from kingsos.backend.app.schemas.project import Project
from kingsos.backend.app.schemas.team import TeamMember
from app.models.activity import Activity

from app.routes import (
    auth,
    business,
    dashboard,
    customers,
    tasks,
    ai,
    projects,
    team,
    activity,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KingsOS API",
    description="AI Business Operating System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(business.router)
app.include_router(dashboard.router)
app.include_router(customers.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(projects.router)
app.include_router(team.router)
app.include_router(activity.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to KingsOS"
    }


# Swagger JWT Authorize Button
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
