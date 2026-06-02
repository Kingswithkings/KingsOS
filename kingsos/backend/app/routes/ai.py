import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

from app.database import get_db
from app.models.business import Business
from kingsos.backend.app.schemas.customer import Customer
from kingsos.backend.app.schemas.task import Task
from kingsos.backend.app.schemas.project import Project

load_dotenv()

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "kingsos")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing")

if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY is missing")

openai_client = OpenAI(api_key=OPENAI_API_KEY)
pinecone_client = Pinecone(api_key=PINECONE_API_KEY)

existing_indexes = [index["name"] for index in pinecone_client.list_indexes()]

if PINECONE_INDEX_NAME not in existing_indexes:
    pinecone_client.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

index = pinecone_client.Index(PINECONE_INDEX_NAME)


def create_embedding(text: str):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    return response.data[0].embedding


@router.get("/business-analysis")
def business_analysis(db: Session = Depends(get_db)):
    total_customers = db.query(Customer).count()
    total_projects = db.query(Project).count()
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

    score = 50

    score += min(total_customers * 2, 20)
    score += min(completed_tasks * 2, 20)
    score -= min(pending_tasks, 20)

    score = max(0, min(score, 100))

    return {
        "health_score": score,
        "total_customers": total_customers,
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "completed_tasks": completed_tasks,
        "recommendations": [
            "Complete overdue tasks",
            "Follow up active customers",
            "Review project progress"
        ]
    }


@router.post("/sync-business-memory")
def sync_business_memory(db: Session = Depends(get_db)):
    businesses = db.query(Business).all()
    customers = db.query(Customer).all()
    tasks = db.query(Task).all()
    projects = db.query(Project).all()

    records = []

    for business in businesses:
        text = f"Business: {business.business_name}. Type: {business.business_type}. Owner: {business.owner_name}. Email: {business.email}."
        records.append(("business", business.id, text))

    for customer in customers:
        text = f"Customer: {customer.name}. Company: {customer.company}. Status: {customer.status}. Notes: {customer.notes}."
        records.append(("customer", customer.id, text))

    for task in tasks:
        text = f"Task: {task.title}. Description: {task.description}. Priority: {task.priority}. Status: {task.status}. Assigned to: {task.assigned_to}. Due date: {task.due_date}."
        records.append(("task", task.id, text))

    for project in projects:
        text = f"Project: {project.name}. Description: {project.description}. Status: {project.status}. Owner: {project.owner}."
        records.append(("project", project.id, text))

    vectors = []

    for record_type, record_id, text in records:
        embedding = create_embedding(text)

        vectors.append({
            "id": f"{record_type}-{record_id}",
            "values": embedding,
            "metadata": {
                "type": record_type,
                "record_id": record_id,
                "text": text
            }
        })

    if vectors:
        index.upsert(vectors=vectors)

    return {
        "message": "Business memory synced to Pinecone",
        "records_synced": len(vectors)
    }


@router.post("/ask")
def ask_ai(
    question: str,
    db: Session = Depends(get_db)
):
    try:
        question_embedding = create_embedding(question)

        search_results = index.query(
            vector=question_embedding,
            top_k=5,
            include_metadata=True
        )

        retrieved_context = []

        for match in search_results.get("matches", []):
            metadata = match.get("metadata", {})
            text = metadata.get("text")

            if text:
                retrieved_context.append(text)

        total_businesses = db.query(Business).count()
        total_customers = db.query(Customer).count()
        total_tasks = db.query(Task).count()
        total_projects = db.query(Project).count()

        pending_tasks = db.query(Task).filter(Task.status == "pending").count()
        completed_tasks = db.query(Task).filter(Task.status == "completed").count()

        business_context = f"""
KingsOS Business Data:
- Total businesses: {total_businesses}
- Total customers: {total_customers}
- Total projects: {total_projects}
- Total tasks: {total_tasks}
- Pending tasks: {pending_tasks}
- Completed tasks: {completed_tasks}

Relevant memory from Pinecone:
{chr(10).join(retrieved_context)}
"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are KingsOS AI Assistant, an intelligent business operating assistant "
                        "for startups and SMEs. Give clear, practical, business-focused advice. "
                        "Use the provided business context. Do not invent data."
                    )
                },
                {
                    "role": "user",
                    "content": f"{business_context}\n\nUser question: {question}"
                }
            ],
            temperature=0.4
        )

        answer = response.choices[0].message.content

        return {
            "question": question,
            "answer": answer,
            "context_used": retrieved_context,
            "data_used": {
                "total_businesses": total_businesses,
                "total_customers": total_customers,
                "total_projects": total_projects,
                "total_tasks": total_tasks,
                "pending_tasks": pending_tasks,
                "completed_tasks": completed_tasks
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
