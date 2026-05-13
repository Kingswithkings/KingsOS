from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    full_name: str
    business_name: str
    business_type: str
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class UserResponse(BaseModel):
    id: int
    full_name: str
    business_name: str
    business_type: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)