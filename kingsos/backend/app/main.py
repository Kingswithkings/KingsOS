from fastapi import FastAPI

from app.routes import (
    business,
    auth
)

app = FastAPI(
    title="KingsOS API",
    description="AI Business Operating System",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(business.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to KingsOS"
    }