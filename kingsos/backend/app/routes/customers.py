from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from kingsos.backend.app.schemas.customer import Customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

Base.metadata.create_all(bind=engine)


def ensure_customer_columns():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(customers)"))
        }

        if "business_id" not in columns:
            connection.execute(
                text("ALTER TABLE customers ADD COLUMN business_id INTEGER")
            )


ensure_customer_columns()


@router.post("/create")
def create_customer(
    name: str,
    email: str = None,
    phone: str = None,
    company: str = None,
    status: str = "lead",
    notes: str = None,
    business_id: int = None,
    db: Session = Depends(get_db)
):
    new_customer = Customer(
        name=name,
        email=email,
        phone=phone,
        company=company,
        status=status,
        notes=notes,
        business_id=business_id
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return {
        "message": "Customer created successfully",
        "customer": new_customer
    }


@router.get("/")
def get_all_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()

    return {
        "total": len(customers),
        "customers": customers
    }


@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer
