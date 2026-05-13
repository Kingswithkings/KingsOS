from fastapi import FastAPI
from app.routes import business

app = FastAPI(
    title="KingsOS API",
    description="AI Business Operating System for startups and SMEs",
    version="1.0.0"
)

app.include_router(business.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to KingsOS",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }