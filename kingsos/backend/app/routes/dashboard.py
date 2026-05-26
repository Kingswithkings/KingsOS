from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.business import Business
from app.routes.customers import Customer
from app.routes.tasks import Task

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_businesses = db.query(Business).count()
    total_customers = db.query(Customer).count()
    total_tasks = db.query(Task).count()

    recent_customers = db.query(Customer).order_by(Customer.id.desc()).limit(3).all()
    recent_tasks = db.query(Task).order_by(Task.id.desc()).limit(3).all()

    return {
        "total_customers": total_customers,
        "total_tasks": total_tasks,
        "total_businesses": total_businesses,
        "recent_activity": {
            "recent_customers": recent_customers,
            "recent_tasks": recent_tasks
        },
        "ai_insights": [
            "AI insights will be added in the next phase.",
            "KingsOS can now track businesses, customers, and tasks."
        ]
    }