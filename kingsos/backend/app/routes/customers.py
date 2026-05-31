from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    status = Column(String, default="lead")
    notes = Column(String, nullable=True)


Base.metadata.create_all(bind=engine)


@router.post("/create")
def create_customer(
    name: str,
    email: str = None,
    phone: str = None,
    company: str = None,
    status: str = "lead",
    notes: str = None,
    db: Session = Depends(get_db)
):
    new_customer = Customer(
        name=name,
        email=email,
        phone=phone,
        company=company,
        status=status,
        notes=notes
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
