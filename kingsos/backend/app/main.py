from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

from app.database import Base, engine
from app.models.user import User
from app.routes import business, auth, dashboard, customers, tasks, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KingsOS API",
    description="AI Business Operating System",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(business.router)
app.include_router(dashboard.router)
app.include_router(customers.router)
app.include_router(tasks.router)
app.include_router(ai.router)

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
