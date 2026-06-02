from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"
    owner: str | None = None
    business_id: int | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str
    owner: str | None = None
    business_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
