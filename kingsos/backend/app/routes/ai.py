from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.business import Business
from app.routes.customers import Customer
from app.routes.tasks import Task

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


@router.post("/ask")
def ask_ai(
    question: str,
    db: Session = Depends(get_db)
):
    total_businesses = db.query(Business).count()
    total_customers = db.query(Customer).count()
    total_tasks = db.query(Task).count()

    pending_tasks = (
        db.query(Task)
        .filter(Task.status == "pending")
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(Task.status == "completed")
        .count()
    )

    question_lower = question.lower()

    if "summary" in question_lower or "dashboard" in question_lower:
        answer = (
            f"KingsOS currently has {total_businesses} business record(s), "
            f"{total_customers} customer(s), and {total_tasks} task(s). "
            f"There are {pending_tasks} pending task(s) and "
            f"{completed_tasks} completed task(s)."
        )

    elif "task" in question_lower:
        answer = (
            f"You currently have {total_tasks} task(s). "
            f"{pending_tasks} are pending and {completed_tasks} are completed."
        )

    elif "customer" in question_lower:
        answer = (
            f"You currently have {total_customers} customer(s) in your CRM."
        )

    elif "focus" in question_lower:
        answer = (
            f"Your immediate focus should be on completing your "
            f"{pending_tasks} pending task(s), following up with customers, "
            f"and keeping your business records updated."
        )

    else:
        answer = (
            "I am the KingsOS AI Assistant. I can currently answer questions "
            "about your dashboard, customers, tasks, and business summary."
        )

    return {
        "question": question,
        "answer": answer,
        "data_used": {
            "total_businesses": total_businesses,
            "total_customers": total_customers,
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks
        }
    }